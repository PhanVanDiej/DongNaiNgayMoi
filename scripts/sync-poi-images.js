/**
 * Script: sync-poi-images.js
 * Mục đích: Scan ảnh POI trên Digital Ocean Spaces và cập nhật field `images` trong pois.json
 * 
 * Cách chạy:
 *   node scripts/sync-poi-images.js
 * 
 * Yêu cầu:
 *   - npm install @aws-sdk/client-s3 dotenv
 *   - File .env với SPACES_ENDPOINT, SPACES_REGION, SPACES_BUCKET, SPACES_KEY, SPACES_SECRET
 */

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ CONFIG ============
const SPACES_ENDPOINT = process.env.SPACES_ENDPOINT || "https://sgp1.digitaloceanspaces.com";
const SPACES_REGION = process.env.SPACES_REGION || "sgp1";
const SPACES_BUCKET = process.env.SPACES_BUCKET || "dongnaingaymoi";
const SPACES_KEY = process.env.SPACES_KEY;
const SPACES_SECRET = process.env.SPACES_SECRET;

// Folder chứa ảnh POI trên Spaces
const POI_IMAGE_PREFIX = "pois/";

// Base URL để tạo link ảnh
const POI_IMAGE_BASE = process.env.VITE_POI_IMAGE_BASE || `https://${SPACES_BUCKET}.${SPACES_REGION}.digitaloceanspaces.com/pois`;

// Path tới pois.json
const POIS_JSON_PATH = path.resolve(__dirname, "../public/data/pois.json");

// Các extension ảnh hỗ trợ
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

// ============ MAIN ============

async function main() {
    console.log("🚀 Bắt đầu sync ảnh POI từ Digital Ocean Spaces...\n");

    // 1. Kiểm tra credentials
    if (!SPACES_KEY || !SPACES_SECRET) {
        console.error("❌ Thiếu SPACES_KEY hoặc SPACES_SECRET trong .env");
        console.log("\nVui lòng thêm vào file .env:");
        console.log("SPACES_KEY=your_access_key");
        console.log("SPACES_SECRET=your_secret_key");
        process.exit(1);
    }

    // 2. Đọc pois.json
    console.log(`📂 Đọc file: ${POIS_JSON_PATH}`);
    if (!fs.existsSync(POIS_JSON_PATH)) {
        console.error(`❌ Không tìm thấy file: ${POIS_JSON_PATH}`);
        process.exit(1);
    }

    const poisData = JSON.parse(fs.readFileSync(POIS_JSON_PATH, "utf-8"));
    console.log(`   ✓ Tìm thấy ${poisData.length} POIs\n`);

    // 3. Tạo map từ POI id để tra cứu nhanh
    const poiMap = new Map();
    for (const poi of poisData) {
        poiMap.set(String(poi.id), poi);
    }

    // 4. Kết nối Digital Ocean Spaces (S3 compatible)
    console.log(`🌐 Kết nối tới: ${SPACES_ENDPOINT}`);
    console.log(`   Bucket: ${SPACES_BUCKET}`);
    console.log(`   Prefix: ${POI_IMAGE_PREFIX}\n`);

    const s3Client = new S3Client({
        endpoint: SPACES_ENDPOINT,
        region: SPACES_REGION,
        credentials: {
            accessKeyId: SPACES_KEY,
            secretAccessKey: SPACES_SECRET,
        },
        forcePathStyle: false,
    });

    // 5. List tất cả objects trong folder pois/
    const imagesByPoiId = new Map(); // Map<poiId, string[]>

    let continuationToken = undefined;
    let totalFiles = 0;

    try {
        do {
            const command = new ListObjectsV2Command({
                Bucket: SPACES_BUCKET,
                Prefix: POI_IMAGE_PREFIX,
                ContinuationToken: continuationToken,
            });

            const response = await s3Client.send(command);
            const contents = response.Contents || [];

            for (const obj of contents) {
                const key = obj.Key; // e.g., "pois/poi-001.jpg"
                const fileName = path.basename(key); // e.g., "poi-001.jpg"
                const ext = path.extname(fileName).toLowerCase();

                // Chỉ xử lý file ảnh
                if (!IMAGE_EXTENSIONS.includes(ext)) continue;

                // Lấy ID từ tên file (bỏ extension)
                const poiId = path.basename(fileName, ext); // e.g., "poi-001"

                // Tạo URL đầy đủ
                const imageUrl = `${POI_IMAGE_BASE}/${fileName}`;

                // Thêm vào map
                if (!imagesByPoiId.has(poiId)) {
                    imagesByPoiId.set(poiId, []);
                }
                imagesByPoiId.get(poiId).push(imageUrl);
                totalFiles++;
            }

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        console.log(`📷 Tìm thấy ${totalFiles} file ảnh cho ${imagesByPoiId.size} POIs\n`);

    } catch (error) {
        console.error("❌ Lỗi khi list objects từ Spaces:", error.message);
        process.exit(1);
    }

    // 6. Cập nhật field images cho từng POI
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundIds = [];

    for (const poi of poisData) {
        const poiId = String(poi.id);
        const images = imagesByPoiId.get(poiId);

        if (images && images.length > 0) {
            // Sắp xếp để đảm bảo thứ tự nhất quán
            images.sort();
            poi.images = images;
            updatedCount++;
            console.log(`   ✓ ${poiId}: ${images.length} ảnh`);
        } else {
            // Không tìm thấy ảnh cho POI này
            notFoundCount++;
            notFoundIds.push(poiId);
            // Giữ nguyên images cũ hoặc set mảng rỗng
            if (!poi.images) {
                poi.images = [];
            }
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Kết quả:`);
    console.log(`   ✓ Đã cập nhật: ${updatedCount} POIs`);
    console.log(`   ⚠ Không có ảnh: ${notFoundCount} POIs`);

    if (notFoundIds.length > 0 && notFoundIds.length <= 20) {
        console.log(`\n   POIs chưa có ảnh: ${notFoundIds.join(", ")}`);
    }

    // 7. Ghi lại pois.json
    console.log(`\n💾 Ghi file: ${POIS_JSON_PATH}`);
    fs.writeFileSync(POIS_JSON_PATH, JSON.stringify(poisData, null, 2), "utf-8");
    console.log("   ✓ Đã lưu thành công!\n");

    // 8. Tạo report file (optional)
    const reportPath = path.resolve(__dirname, "../poi-images-report.json");
    const report = {
        syncedAt: new Date().toISOString(),
        totalPois: poisData.length,
        poisWithImages: updatedCount,
        poisWithoutImages: notFoundCount,
        notFoundIds: notFoundIds,
        imagesByPoi: Object.fromEntries(imagesByPoiId),
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`📄 Report đã lưu tại: ${reportPath}`);

    console.log("\n✅ Hoàn tất!");
}

main().catch((err) => {
    console.error("❌ Lỗi không xử lý được:", err);
    process.exit(1);
});