import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
const SPACES_ENDPOINT = process.env.SPACES_ENDPOINT;
const SPACES_REGION = process.env.SPACES_REGION;
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

const communesIndexPath = path.join(__dirname, "..", "server", "data", "communes.index.json");

if (!fs.existsSync(communesIndexPath)) {
    console.error("⚠️ Không tìm thấy communes.index.json tại:", communesIndexPath);
    process.exit(1);
}

const raw = fs.readFileSync(communesIndexPath, "utf8");
const communesObj = JSON.parse(raw);

function getFolderId(slug, c) {
    return (c.id || slug || "").trim();
}

// ==== 3. Tạo "folder" bằng cách put file .keep bên trong ====
async function createFolderForCommune(id) {
    const prefix = `communes/${id}/`;
    const key = `${prefix}.keep`; // file rỗng để DO hiện folder

    const cmd = new PutObjectCommand({
        Bucket: SPACES_BUCKET,
        Key: key,
        Body: "",
        ACL: "public-read", // nếu Space ở chế độ public
    });

    await s3.send(cmd);
    console.log(`✅ Created folder: ${prefix}`);
}

async function main() {
    const entries = Object.entries(communesObj); // [slug, obj][]
    console.log(`Tìm thấy ${entries.length} commune trong communes.index.json`);

    let created = 0;

    for (const [slug, c] of entries) {
        const id = getFolderId(slug, c);
        if (!id) {
            console.warn(`⚠️ Bỏ qua entry slug=${slug} vì không có id`);
            continue;
        }

        try {
            await createFolderForCommune(id);
            created++;
        } catch (e) {
            console.error(`❌ Lỗi tạo folder cho ${id}:`, e.message);
        }
    }

    console.log(`\nHoàn thành. Đã tạo folder cho ${created} commune.`);
}

main().catch((e) => {
    console.error("❌ Script lỗi:", e);
    process.exit(1);
});
