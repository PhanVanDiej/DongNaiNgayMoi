import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== 1. Config Spaces từ .env ====
const SPACES_KEY = process.env.SPACES_KEY;
const SPACES_SECRET = process.env.SPACES_SECRET;
const SPACES_ENDPOINT =
    process.env.SPACES_ENDPOINT || "https://sgp1.digitaloceanspaces.com";
const SPACES_REGION = process.env.SPACES_REGION || "sgp1";
const SPACES_BUCKET = process.env.SPACES_BUCKET;

if (!SPACES_KEY || !SPACES_SECRET || !SPACES_BUCKET) {
    console.error("⚠️ Thiếu SPACES_KEY / SPACES_SECRET / SPACES_BUCKET trong .env");
    process.exit(1);
}

const s3 = new S3Client({
    region: SPACES_REGION,
    endpoint: SPACES_ENDPOINT,
    credentials: {
        accessKeyId: SPACES_KEY,
        secretAccessKey: SPACES_SECRET,
    },
});

// ==== 2. Đọc communes.index.json ====
const communesIndexPath = path.join(__dirname, "..", "server", "data", "communes.index.json");

if (!fs.existsSync(communesIndexPath)) {
    console.error("⚠️ Không tìm thấy communes.index.json tại:", communesIndexPath);
    process.exit(1);
}

const raw = fs.readFileSync(communesIndexPath, "utf8");
const communesObj = JSON.parse(raw);

// ==== 3. Hàm list file trong 1 prefix Spaces ====
async function listFilesInPrefix(prefix) {
    const files = [];
    let ContinuationToken = undefined;

    while (true) {
        const res = await s3.send(
            new ListObjectsV2Command({
                Bucket: SPACES_BUCKET,
                Prefix: prefix,
                ContinuationToken,
            })
        );

        const contents = res.Contents || [];
        for (const obj of contents) {
            const key = obj.Key;
            if (!key) continue;

            // bỏ qua "folder" và file .keep
            if (key.endsWith("/")) continue;

            const name = key.substring(prefix.length); // "communes/id/" + "cover.jpg"
            if (!name || name === ".keep") continue;

            files.push(name);
        }

        if (!res.IsTruncated) break;
        ContinuationToken = res.NextContinuationToken;
    }

    return files;
}

// ==== 4. Sync images cho từng commune ====
async function main() {
    const entries = Object.entries(communesObj); // [slug, obj][]
    console.log(`Tìm thấy ${entries.length} commune trong communes.index.json`);
    let updated = 0;

    for (const [slug, c] of entries) {
        if (!c) continue;

        const id = (c.id || slug || "").trim();
        if (!id) {
            console.warn(`⚠️ Bỏ qua commune slug=${slug} vì không có id.`);
            continue;
        }

        const prefix = `communes/${id}/`;
        try {
            const files = await listFilesInPrefix(prefix);

            if (!files.length) {
                console.log(`- ${id}: không có ảnh nào trong Spaces (prefix ${prefix}).`);
                continue;
            }

            // Sắp xếp cho ổn định
            files.sort();

            c.images = files;
            updated++;

            console.log(`✅ ${id}: synced ${files.length} ảnh.`);
        } catch (e) {
            console.error(`❌ Lỗi sync images cho ${id}:`, e.message);
        }
    }

    // Ghi lại file JSON
    fs.writeFileSync(communesIndexPath, JSON.stringify(communesObj, null, 2), "utf8");
    console.log(`\nHoàn thành. Đã cập nhật images cho ${updated} commune.`);
}

main().catch((e) => {
    console.error("❌ Script lỗi:", e);
    process.exit(1);
});
