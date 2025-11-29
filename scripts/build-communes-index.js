// server/scripts/build-communes-index.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ==== Resolve đường dẫn gốc của thư mục server ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ĐƯỜNG DẪN INPUT / OUTPUT
const GEOJSON_PATH = path.join(__dirname, "..","public", "data", "dong_nai.geojson");
const OUTPUT_PATH = path.join(__dirname, "..", "server", "data", "communes.index.json");

// ==== Helper chuẩn hoá tiếng Việt & slug id ====
function normVN(str = "") {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/gi, "d")
        .toLowerCase();
}

function slugifyName(name = "") {
    const base = normVN(name)
        .replace(/[^a-z0-9\s]/g, " ") // bỏ ký tự lạ
        .replace(/đ/gi, "d")
        .trim()
        .replace(/\s+/g, "-");
    return base || "unknown";
}

// parse dân số: "12.345" / "12,345" -> 12345
function parsePopulation(raw) {
    if (!raw) return null;
    const s = String(raw).replace(/[^\d]/g, "");
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

// parse diện tích: "123,45 km²" / "12 345 km2" -> 123.45
function parseAreaKm2(raw) {
    if (!raw) return null;
    let s = String(raw)
        .toLowerCase()
        .replace(/km²|km2/g, "")
        .replace(/\s+/g, "")
        .replace(/,/g, "."); // dùng . làm dấu thập phân
    s = s.replace(/[^\d.]/g, "");
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

async function main() {
    console.log("Đọc GeoJSON từ:", GEOJSON_PATH);
    const raw = await fs.readFile(GEOJSON_PATH, "utf8");
    const geo = JSON.parse(raw);

    const features = geo.features || [];
    console.log("Tổng số feature:", features.length);

    const result = {};

    for (const f of features) {
        const p = f.properties || {};

        // Tên, loại, tỉnh
        const name = p["Tên đơn vị"] || p["Ten don vi"] || "";
        if (!name) continue; // không có tên thì bỏ qua

        const typeRaw = p["Phân loại"] || p["Phan loai"] || "";
        const type = typeRaw.toLowerCase(); // "xã" / "phường" ...

        const province = p["Tỉnh thành"] || p["Tinh thanh"] || "Tỉnh Đồng Nai mới";

        // Dân số / diện tích
        const population = parsePopulation(p["Dân số"] || p["Dan so"]);
        const area_km2 = parseAreaKm2(p["Diện tích"] || p["Dien tich"]);

        // Mã hành chính (nếu muốn dùng sau này)
        const code = p["Mã hành chính"] || p["Ma hanh chinh"] || "";

        // id slug
        const id = slugifyName(name); // ví dụ "Xã Bù Đăng" -> "xa-bu-dang"

        // Ghép object index
        result[id] = {
            id,                          // "xa-bu-dang"
            code,                        // "25225" (nếu có), không có thì ""
            name,                        // "Xã Bù Đăng"
            type,                        // "xã" / "phường" (đã toLowerCase)
            district: "Đồng Nai",        // mô hình mới: chỉ tỉnh - xã/phường, tạm đặt "Đồng Nai"
            province,                    // "Tỉnh Đồng Nai mới" hoặc từ file

            // Thông tin tổng quan – phần nào không có thì null / ""
            established: "",             // chưa có trong geojson -> để trống
            population,                  // số hoặc null
            area_km2,                    // số hoặc null
            admin_center: "",            // chưa có -> để trống

            // Ảnh cover: bạn có thể tạo folder images theo id sau này
            coverImage: `/images/communes/${id}/cover.jpg`,

            // Ghi chú / thời điểm cập nhật – để trống, sau này có thể tự sửa tay
            note: "",
            updatedAt: ""
        };
    }

    // Ghi file JSON
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf8");
    console.log("Đã ghi communes.index.json vào:", OUTPUT_PATH);
}

main().catch((err) => {
    console.error("Lỗi khi build communes.index:", err);
    process.exit(1);
});
