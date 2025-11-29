import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tới communes.index.json
const communesIndexPath = path.join(__dirname, "..","server", "data", "communes.index.json");

if (!fs.existsSync(communesIndexPath)) {
    console.error("⚠️ Không tìm thấy communes.index.json tại:", communesIndexPath);
    process.exit(1);
}

const raw = fs.readFileSync(communesIndexPath, "utf8");
const communesObj = JSON.parse(raw);

let changed = 0;

for (const [slug, c] of Object.entries(communesObj)) {
    if (!c) continue;

    const cover = c.coverImage;
    if (!cover) continue;

    // Lấy tên file: "/images/communes/phuong-bien-hoa/cover.jpg" -> "cover.jpg"
    const filename = String(cover).split("/").filter(Boolean).pop();

    if (!filename) {
        console.warn(`⚠️ Không extract được filename từ coverImage của ${slug}: ${cover}`);
        continue;
    }

    if (!Array.isArray(c.images)) {
        c.images = [];
    }

    // Nếu images rỗng hoặc chưa chứa cover -> thêm vào đầu danh sách
    if (!c.images.includes(filename)) {
        c.images.unshift(filename);
    }

    // Xoá field coverImage cũ
    delete c.coverImage;
    changed++;
}

fs.writeFileSync(communesIndexPath, JSON.stringify(communesObj, null, 2), "utf8");

console.log(`✅ Đã migrate xong. ${changed} communes được chuyển coverImage -> images.`);
