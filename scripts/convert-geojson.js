// scripts/convert-geojson.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// đường dẫn input / output – chỉnh lại nếu bạn để file chỗ khác
const INPUT = path.join(__dirname, "..", "public", "data", "dong_nai.geojson");
const OUTPUT = path.join(__dirname, "..", "public", "data", "dongnai-95.geojson");

// helper bỏ dấu + lower
function norm(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // bỏ toàn bộ dấu
    .replace(/đ/gi, "d")               // đ / Đ -> d
    .toLowerCase()
    .trim();
}


async function main() {
    const raw = await fs.readFile(INPUT, "utf8");
    const src = JSON.parse(raw);

    const out = {
        type: "FeatureCollection",
        name: "dongnai-95",
        features: []
    };

    for (let i = 0; i < src.features.length; i++) {
        const f = src.features[i];
        const p = f.properties || {};

        const name = p["Tên đơn vị"] || "";
        const type = p["Phân loại"] || "";
        const province = p["Tỉnh thành"] || "Tỉnh Đồng Nai mới";
        const code = p["Mã hành chính"] || `XA${String(i + 1).padStart(3, "0")}`;

        // parse dân số: giữ lại digits
        let population = null;
        const popRaw = (p["Dân số"] || "").trim();
        if (popRaw) {
            const digits = popRaw.replace(/[^\d]/g, "");
            if (digits) population = Number(digits);
        }

        // parse diện tích: "246.711 km²" hoặc "246,711 km2"
        let area_km2 = null;
        const areaRaw = (p["Diện tích"] || "").trim();
        if (areaRaw) {
            let s = areaRaw.replace(/km²|km2/gi, "").replace(/\s+/g, "");
            s = s.replace(",", ".");
            const n = Number(s);
            if (!Number.isNaN(n)) area_km2 = n;
        }

        const props = {
            id: code,
            code,
            name,
            type,
            province
        };
        if (population != null) props.population = population;
        if (area_km2 != null) props.area_km2 = area_km2;

        out.features.push({
            type: "Feature",
            geometry: f.geometry,
            properties: props
        });
    }

    await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
    await fs.writeFile(OUTPUT, JSON.stringify(out), "utf8");

    console.log(`✅ Done. Saved ${out.features.length} features to ${OUTPUT}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
