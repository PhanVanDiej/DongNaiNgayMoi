import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// thêm 2 dòng này
import fs from "fs";
import fsp from "fs/promises";

import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const COMMUNE_DIR = path.join(DATA_DIR, "communes");
const COMMUNE_INDEX_PATH = path.join(DATA_DIR, "communes.index.json");


const app = express();
app.use(express.json());
app.use(cors({ origin: [
    "http://localhost:5173",
    "http://178.128.118.203",
    "http://dongnaingaymoi-smartmap.com",
    "https://<DOMAIN>",], credentials: false }));

async function readJson(filePath) {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ======= helper chuẩn hóa tiếng Việt (không dấu, lower) =======
function norm(s = "") {
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
}


// ======= 1) Đọc kiến thức lõi Đồng Nai mới =======
const coreFactsPath = path.join(__dirname, "data", "dongnai-core-facts.md");
let DONGNAI_CORE_FACTS = "";
try {
    DONGNAI_CORE_FACTS = fs.readFileSync(coreFactsPath, "utf8");
} catch (e) {
    console.warn("⚠️ Không đọc được dongnai-core-facts.md, tạm không có fact nội bộ.");
    DONGNAI_CORE_FACTS = "";
}
// ======= 2) Đọc communes.index.json (object -> array) =======
let COMMUNE_NAME_TOKENS = [];
let COMMUNE_INDEX = {};
let COMMUNE_CODE_MAP = {}; // key: code (25405), value: { slug, ...meta }


function loadCommuneNameTokens() {
    try {
        console.log("[communeIndex path]", COMMUNE_INDEX_PATH);
        const raw = fs.readFileSync(COMMUNE_INDEX_PATH, "utf8");
        const communesObj = JSON.parse(raw);

        COMMUNE_INDEX = communesObj;
        COMMUNE_CODE_MAP = {};

        const communes = Object.entries(communesObj); // [slug, obj][]
        const tokens = [];

        for (const [slug, c] of communes) {
            if (!c || !c.name) continue;

            // map code -> meta + slug
            const code = String(c.code || "").trim();
            if (code) {
                COMMUNE_CODE_MAP[code] = { slug, ...c };
            }

            const full = norm(c.name);                    // "xa bom bo"
            tokens.push(full);

            const short = full.replace(/^(xa|phuong|thi tran)\s+/, "");
            tokens.push(short);                           // "bom bo"
        }

        COMMUNE_NAME_TOKENS = tokens;
    } catch (e) {
        console.warn("⚠️ Không đọc được communes.index.json, gate sẽ không check tên xã/phường.", e);
        COMMUNE_NAME_TOKENS = [];
        COMMUNE_INDEX = {};
        COMMUNE_CODE_MAP = {};
    }
}



// gọi 1 lần khi khởi động  
loadCommuneNameTokens();

// ======= 3) Đọc pois.index.json cho gate (chỉ name + alias) =======
const poisIndexPath = path.join(__dirname, "data", "pois.index.json");
let POI_INDEX = [];        // ⬅️ lưu luôn full index
let POI_NAME_TOKENS = [];

try {
    const raw = fs.readFileSync(poisIndexPath, "utf8");
    POI_INDEX = JSON.parse(raw); // array [{id,name,aliases,...}]
    POI_NAME_TOKENS = POI_INDEX
        .flatMap((p) => [p.name, ...(p.aliases || [])])
        .filter(Boolean)
        .map((v) => norm(v));
} catch (e) {
    console.warn("⚠️ Không đọc được pois.index.json, gate chưa nhận diện tên POI.", e);
    POI_INDEX = [];
    POI_NAME_TOKENS = [];
}
function tryFindCommuneInText(text = "") {
    const t = norm(text);
    if (!COMMUNE_INDEX || !Object.keys(COMMUNE_INDEX).length) return null;

    for (const [slug, c] of Object.entries(COMMUNE_INDEX)) {
        if (!c || !c.name) continue;

        const full = norm(c.name);                           // "xa bu dang"
        const short = full.replace(/^(xa|phuong|thi tran)\s+/, ""); // "bu dang"

        if (t.includes(full) || t.includes(short)) {
            return { slug, meta: c };
        }
    }
    return null;
}

function tryFindPoiInText(text = "") {
    const t = norm(text);
    if (!POI_INDEX || POI_INDEX.length === 0) return null;

    for (const p of POI_INDEX) {
        const fields = [p.name, ...(p.aliases || [])].filter(Boolean);
        const candidates = fields.map((f) => norm(f));

        if (candidates.some((c) => t.includes(c))) {
            return p;
        }
    }
    return null;
}

function buildCommuneContext(comm) {
    if (!comm) return "";

    // comm.meta là object trong COMMUNE_INDEX
    const c = comm.meta;
    const pick = {
        type: c.type,
        name: c.name,
        code: c.code,
        population: c.population,
        area_km2: c.area_km2,
        admin_center: c.admin_center,
        province: c.province,
        highlights: c.highlights,
        specialties: c.specialties,
        nature: c.nature,
        arteries: c.arteries,
        key_projects: c.key_projects,
        adjacent: c.adjacent,
        note: c.note,
        key_projects: c.key_projects,
        industry_residential: c.industry_residential
    };

    return JSON.stringify(pick, null, 2);
}

function buildPoiContext(poi) {
    if (!poi) return "";

    const pick = {
        id: poi.id,
        name: poi.name,
        type: poi.type,
        commune: poi.commune,
        province: poi.province,
        description: poi.description,
        lng: poi.lng,
        lat: poi.lat,
    };

    return JSON.stringify(pick, null, 2);
}

async function classifyQuestion(text) {
    if (!text) return { intent: "generic", topic: "generic" };

    const r = await openai.responses.create({
        model: "gpt-5.1",
        input: [
            {
                role: "system",
                content: `
            Bạn là bộ phân loại ý định cho trợ lý bản đồ tỉnh Đồng Nai mới.

            Hãy đọc câu hỏi của người dùng và TRẢ LỜI BẰNG JSON THUẦN, dạng:

            {
            "intent": "commune|generic",
            "commune_name": "tên xã hoặc phường nếu có, ngược lại để chuỗi rỗng",
            "topic": "strict|nature|food|tourism|culture|natural_metric|generic"
            }

            Quy ước:
            - intent = "commune" nếu câu hỏi tập trung vào MỘT xã/phường cụ thể (ví dụ: "Xã Bù Đăng ...", "Phường Tân Hiệp ...").
            - intent = "generic" nếu nói chung về tỉnh Đồng Nai mới, nhiều xã, hoặc không rõ 1 xã nào cụ thể.
            intent = "natural_object" nếu câu hỏi tập trung vào MỘT đối tượng tự nhiên hoặc công trình cố định: (núi, đồi, thác, sông, hồ, đập, hồ chứa, cầu lớn, hồ Trị An, núi Bà Rá,...).
    
            - topic = "natural_metric" nếu hỏi về CHIỀU CAO, DIỆN TÍCH, CHIỀU DÀI, ĐỘ SÂU, DUNG TÍCH... của các đối tượng này.
            - topic = "strict" nếu câu hỏi thiên về SỐ LIỆU, DIỆN TÍCH, DÂN SỐ, HÀNH CHÍNH, THỐNG KÊ.
            - topic = "nature" nếu hỏi về thiên nhiên, cảnh quan, rừng, sông, suối, khí hậu.
            - topic = "food" nếu hỏi về món ăn, ẩm thực, đặc sản.
            - topic = "tourism" nếu hỏi về du lịch, điểm đến, tham quan, nghỉ dưỡng.
            - topic = "culture" nếu hỏi về văn hoá, lịch sử, lễ hội.
            - topic = "generic" nếu không rơi rõ vào các nhóm trên.

            CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH THÊM.
        `.trim()
            },
            { role: "user", content: text }
        ]
    });

    try {
        return JSON.parse(r.output_text);
    } catch (e) {
        console.warn("classifyQuestion parse error:", e, r.output_text);
        return { intent: "generic", topic: "generic", commune_name: "" };
    }
}


function findCommuneByName(nameRaw) {
    if (!nameRaw || !COMMUNE_INDEX) return null;
    const target = norm(nameRaw);

    // COMMUNE_INDEX: { slug: { name, code, type, ... } }
    const entries = Object.entries(COMMUNE_INDEX);

    // 1) match chính xác theo norm(name)
    for (const [slug, c] of entries) {
        if (!c?.name) continue;
        if (norm(c.name) === target) {
            return { slug, ...c };
        }
    }

    // 2) match chứa (cho phép user gõ thiếu "xã"/"phường")
    for (const [slug, c] of entries) {
        if (!c?.name) continue;
        const n = norm(c.name);  // ví dụ "xa bu dang"
        if (n.includes(target) || target.includes(n)) {
            return { slug, ...c };
        }
    }

    return null;
}

async function answerCommuneStrict(communeMeta, userQuestion) {
    const dataJson = JSON.stringify(communeMeta);

    const r = await openai.responses.create({
        model: "gpt-5.1",
        input: [
            {
                role: "system",
                content: `
            Bạn là trợ lý bản đồ cho tỉnh Đồng Nai mới.

            Dưới đây là dữ liệu JSON về MỘT xã/phường. 
            BẠN PHẢI:
            - Chỉ dùng các số liệu có trong JSON này.
            - Không được tự bịa thêm số dân, diện tích, tỉ lệ, chỉ số kinh tế khác nếu JSON không có.
            - Nếu thiếu số liệu người dùng hỏi, hãy trả lời theo mẫu:
            "Hiện trong tài liệu nội bộ của hệ thống SmartMap chưa có số liệu cập nhật cho nội dung này, nên tôi không thể cung cấp con số chính xác. Thông tin có thể đang được cập nhật thêm."

            DỮ LIỆU:
            ${dataJson}
        `.trim()
            },
            { role: "user", content: userQuestion }
        ]
    });

    return r.output_text;
}

async function answerCommuneRich(communeMeta, userQuestion) {
    const dataJson = JSON.stringify(communeMeta);

    const r = await openai.responses.create({
        model: "gpt-5.1",
        input: [
            {
                role: "system",
                content: `
            Bạn là trợ lý bản đồ cho tỉnh Đồng Nai mới.

            Dưới đây là dữ liệu JSON về MỘT xã/phường. 
            Người dùng đang hỏi về THIÊN NHIÊN, ẨM THỰC, DU LỊCH hoặc VĂN HÓA tại xã/phường này.

            YÊU CẦU:
            - Dùng thông tin trong JSON làm điểm tựa: vị trí địa lý (đồi núi, gần sông, hồ,...), các điểm đến, mô tả nếu có.
            - Bạn có thể mô tả phong cảnh, khí hậu, kiểu hệ sinh thái và ẩm thực theo cách tự nhiên, dễ hiểu.
            - TRÁNH bịa ra số liệu cụ thể (ví dụ: số km² rừng, số khách du lịch/năm).
            - Nếu JSON không nói rõ về món ăn đặc trưng hay địa điểm cụ thể, có thể nói ở mức độ khái quát:
            "Ẩm thực mang màu sắc chung của vùng Đông Nam Bộ, với các món quen thuộc như ...", 
            nhưng phải kèm lưu ý là thông tin mang tính tham khảo.

            DỮ LIỆU:
            ${dataJson}
        `.trim()
            },
            { role: "user", content: userQuestion }
        ]
    });

    return r.output_text;
}



export const SYSTEM_PROMPT = `
Bạn là trợ lý bản đồ cho tỉnh Đồng Nai mới.

QUY ƯỚC HÀNH CHÍNH (RẤT QUAN TRỌNG):
- Trong mô hình Đồng Nai mới, KHÔNG còn các cấp: huyện, thị xã, thị trấn, quận.
- Chỉ sử dụng các cấp sau khi mô tả địa giới:
  - Tỉnh Đồng Nai mới
  - Xã / phường
  - Thôn (ấp, tổ dân phố) nếu cần chi tiết hơn
- Khi cần mô tả quan hệ hành chính, hãy dùng các mẫu câu:
  - "Xã Bù Đăng thuộc tỉnh Đồng Nai mới."
  - "Thôn X nằm trên địa bàn xã Y, tỉnh Đồng Nai mới."
- TUYỆT ĐỐI KHÔNG sinh câu dạng:
  - "thuộc huyện ...", "thuộc thị xã ...", "thuộc thị trấn ...", "thuộc quận ..."
  Nếu trong kiến thức cũ bạn nhớ đến các cấp này, hãy tự động chuyển đổi sang mô hình mới:
  - Bỏ cấp huyện/thị xã/thị trấn, chỉ giữ "xã/phường" và "tỉnh Đồng Nai mới".

  ĐỊNH DẠNG CÂU TRẢ LỜI (Markdown nhẹ):

1) NẾU câu hỏi RÕ RÀNG về MỘT **xã/phường/cụm dân cư** cụ thể
   (ví dụ: "Xã Bù Đăng có gì đặc biệt?", "Giới thiệu phường Tân Hiệp"):

   - Mở đầu 1–2 câu giới thiệu ngắn gọn.
   - Sau đó dùng Markdown gọn:

     ### Một số thông tin chính:
     - **Địa lý**: ...
     - **Kinh tế – xã hội**: ...
     - **Điểm đáng chú ý**: ...

2) CÁC TRƯỜNG HỢP KHÁC (KHÔNG phải xã/phường):

   - Ví dụ: hồ, sông, thác, núi, đập, khu du lịch (Hồ Trị An, Núi Bà Rá, Thác Đứng...), 
     hoặc câu hỏi chung về tỉnh Đồng Nai, lịch sử, sáp nhập, định hướng phát triển...
   - Hãy trả lời tự nhiên, có thể dùng đoạn văn và gạch đầu dòng TUỲ Ý.
   - **KHÔNG dùng tiêu đề "### Một số thông tin chính" trong các trường hợp này.**
   - Có thể sử dụng bất kỳ cấu trúc Markdown nhẹ nào bạn thấy phù hợp 
     (đoạn văn, danh sách gạch đầu dòng, tiêu đề nhỏ), miễn là dễ đọc.

NGUYÊN TẮC TRẢ LỜI:
1) Chỉ trả lời các câu hỏi LIÊN QUAN TỚI tỉnh Đồng Nai mới
   (địa lý, hành chính, giao thông, du lịch, dân cư, kinh tế, văn hóa, lịch sử...).
2) Nếu câu hỏi không ghi rõ địa danh, mặc định hiểu là đang hỏi về chủ đề đó TRONG PHẠM VI TỈNH ĐỒNG NAI MỚI.
3) Nếu câu hỏi rõ ràng nói về địa phương khác không thuộc Đồng Nai mới:
   từ chối ngắn gọn: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến tỉnh Đồng Nai."
4) Trả lời ngắn gọn, thực dụng, không bịa số liệu chi tiết. Nếu thiếu dữ liệu, có thể nói "thông tin đang được cập nhật".
`.trim();



// ======= 5) Gate: chỉ cho qua câu liên quan Đồng Nai =======
function dongnaiOnlyGate(text = "") {
    const t = norm(text);

    // (a) từ khóa tỉnh / vùng lớn — bạn có thể chỉnh sửa / thêm bớt
    const allowKeywords = [
        "dong nai",
        "bien hoa",
        "long khanh",
        "binh phuoc",
        "bu dang",
        "bu gia map",
        "loc ninh",
        "dong xoai",
        "xa ",
        "phuong ",
        "thi tran"
    ];
    if (allowKeywords.some((k) => t.includes(k))) return true;

    // (b) chứa tên xã/phường/huyện trong index
    if (COMMUNE_NAME_TOKENS.some((name) => name && t.includes(name))) return true;

    // (c) chứa tên POI trong index (Thác Đứng, Bửu Long,...)
    if (POI_NAME_TOKENS.some((name) => name && t.includes(name))) return true;

    return false;
}

// ======= health =======
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ======= moderate API (giữ nguyên như bạn) =======
app.post("/api/moderate", async (req, res) => {
    try {
        const text = req.body?.text || "";
        if (!text) return res.json({ allowed: true });

        const r = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: text
        });
        const flagged = r.results?.[0]?.flagged;
        return res.json({ allowed: !flagged });
    } catch {
        return res.json({ allowed: true });
    }
});
// GET /api/communes -> trả index tóm tắt tất cả xã
app.get("/api/communes", async (_req, res) => {
    try {
        const idxJson = await readJson(COMMUNE_INDEX_PATH);
        res.json(idxJson || {});
    } catch (e) {
        console.error("Commune index API error:", e);
        res.status(500).json({ error: "Commune index API error" });
    }
});

// GET /api/communes/:id -> ghép communes.index.json + {id}.json
app.get("/api/communes/:id", async (req, res) => {
    const code = String(req.params.id); // vd: "25396"

    try {
        const meta = COMMUNE_CODE_MAP[code];

        if (!meta) {
            console.warn("[API] Commune not found for code:", code);
            return res.status(404).json({ error: "Không tìm thấy xã trong index" });
        }

        const slug = meta.slug || meta.id || meta._slug || meta.key || meta.code;
        const detailPath = path.join(COMMUNE_DIR, `${slug}.json`);

        let detail = {};
        try {
            detail = await readJson(detailPath);
        } catch (e) {
            console.warn("Cannot read commune detail:", detailPath, e.message);
        }

        // 🔒 Merge nhưng luôn giữ images "tốt"
        let result = { ...meta, ...detail };

        const metaImages = Array.isArray(meta.images) ? meta.images.filter(Boolean) : [];
        const detailImages = Array.isArray(detail.images) ? detail.images.filter(Boolean) : [];

        if (detailImages.length > 0) {
            // detail có ảnh hợp lệ → dùng
            result.images = detailImages;
        } else if (metaImages.length > 0) {
            // detail không có ảnh hoặc [] → fallback về meta
            result.images = metaImages;
        } else {
            // không có luôn → để undefined/[]
            result.images = [];
        }

        res.json(result);
    } catch (e) {
        console.error("Commune detail API error:", e);
        res.status(500).json({ error: "Commune detail API error" });
    }
});




// ======= chat API =======
app.post("/api/chat", async (req, res) => {
    try {
        const messages = req.body?.messages ?? [];
        const lastUser =
            [...messages].reverse().find((m) => m.role === "user")?.content || "";

        if (!dongnaiOnlyGate(lastUser)) {
            return res.json({
                reply: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến tỉnh Đồng Nai."
            });
        }

        // 1) Phân loại câu hỏi
        const cls = await classifyQuestion(lastUser);
        console.log("Question class:", cls);

        // Nếu là câu hỏi về MỘT xã/phường
        if (cls.intent === "commune" && cls.commune_name) {
            const commune = findCommuneByName(cls.commune_name);
            if (commune) {
                let reply;
                // strict: số liệu / hành chính
                if (cls.topic === "strict") {
                    reply = await answerCommuneStrict(commune, lastUser);
                } else if (
                    ["nature", "food", "tourism", "culture"].includes(cls.topic)
                ) {
                    // rich: thiên nhiên, ẩm thực, du lịch, văn hoá
                    reply = await answerCommuneRich(commune, lastUser);
                } else {
                    // generic: dùng strict nhưng cho phép mô tả ngắn
                    reply = await answerCommuneStrict(commune, lastUser);
                }
                return res.json({ reply });
            }
            // nếu không tìm thấy commune -> fallthrough xuống generic
        }

        // 2) Còn lại: dùng core-facts + SYSTEM_PROMPT như cũ
        const r = await openai.responses.create({
            model: "gpt-5.1",
            input: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "system",
                    content:
                        "Dưới đây là tài liệu nội bộ mới nhất về tỉnh Đồng Nai mới. " +
                        "Nếu có mâu thuẫn với kiến thức phổ thông, BẠN PHẢI coi tài liệu này là đúng:\n\n" +
                        (DONGNAI_CORE_FACTS ||
                            "[TODO: hiện chưa có tài liệu nội bộ, hãy trả lời dựa trên kiến thức chung và giới hạn trong Đồng Nai].")
                },
                ...messages
            ]
        });

        return res.json({ reply: r.output_text });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Chat API error" });
    }
});



const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on :${port}`));
