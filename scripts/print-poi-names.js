// scripts/export-poi-names.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tới pois.json và file output
const poisPath = path.join(__dirname, "..","public", "data", "pois.json");
const outPath = path.join(__dirname, "..","public", "data", "poi-names.txt");

try {
    const raw = fs.readFileSync(poisPath, "utf8");
    const pois = JSON.parse(raw);

    if (!Array.isArray(pois)) {
        console.error("❌ pois.json không phải dạng mảng, cần chỉnh lại script.");
        process.exit(1);
    }

    const lines = pois
        .filter((p) => p && p.name)
        .map((p) => p.name.trim());

    fs.writeFileSync(outPath, lines.join("\n"), "utf8");
    console.log(`✅ Đã ghi ${lines.length} tên POI vào: ${outPath}`);
} catch (err) {
    console.error("❌ Lỗi xử lý:", err.message);
    process.exit(1);
}
