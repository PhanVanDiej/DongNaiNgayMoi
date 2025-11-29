import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 ĐÚNG với cấu trúc hiện tại
const DATA_DIR = path.join(__dirname, "..", "server", "data");
const COMMUNE_DIR = path.join(DATA_DIR, "communes");
const EXCEL_PATH = path.join(DATA_DIR, "communes-data.xlsx");

// helper: "a; b; c" → ["a","b","c"]
function splitList(value) {
    if (!value) return [];
    return String(value)
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
}
function excelDateToString(n) {
    if (!n || isNaN(n)) return n;
    const date = new Date((n - 25569) * 86400 * 1000);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

async function main() {
    // tạo thư mục communes nếu chưa có
    if (!existsSync(COMMUNE_DIR)) {
        mkdirSync(COMMUNE_DIR, { recursive: true });
    }

    // đọc excel
    const wb = XLSX.readFile(EXCEL_PATH);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    for (const row of rows) {
        const id = String(row.id || "").trim();
        if (!id) {
            console.warn("⏭  Bỏ qua 1 dòng vì thiếu 'id'");
            continue;
        }

        const filePath = path.join(COMMUNE_DIR, `${id}.json`);

        // 📌 KHÔNG merge file cũ → ghi đè hoàn toàn
        const data = {
            id,
            name: row.name || "",
            type: row.type || "xã",
            district: row.district || "Đồng Nai",
            established: row.established
                ? isNaN(row.established)
                    ? row.established // là chuỗi → giữ nguyên
                    : excelDateToString(row.established) // là số → convert
                : "",
            population: row.population !== "" ? Number(row.population) : null,
            area_km2: row.area_km2 !== "" ? Number(row.area_km2) : null,
            admin_center: row.admin_center || "",
            leaders: {
                partySecretary: row.partySecretary || "Đang cập nhật",
                chairman: row.chairman || "Đang cập nhật",
            },
            nature: splitList(row.nature),
            arteries: splitList(row.arteries),
            key_projects: splitList(row.key_projects),
            industry_residential: splitList(row.industry_residential),
            adjacent: splitList(row.adjacent),
            highlights: splitList(row.highlights),
            specialties: splitList(row.specialties),
            products: splitList(row.products),
            coverImage:
                row.coverImage ||
                `/images/communes/${id}/cover.jpg`,
            gallery: [],
            note: row.note || "",
            updatedAt: row.updatedAt || "",
        };

        // ghi file json
        await fs.writeFile(filePath, JSON.stringify(data, null, 4), "utf8");
        console.log(`✅ Đã ghi đè: ${filePath}`);
    }

    console.log("🎉 Import xong tất cả communes từ Excel.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
