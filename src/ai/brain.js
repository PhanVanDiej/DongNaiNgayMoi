import { loadCommuneIndex } from "../services/communeIndex";
import { loadPoiIndex, searchPoi } from "../services/poiIndex";
import { tryExtractCommune } from "./nlu";
import { askAI, moderateText } from "./chatClient";
import { norm } from "../utils/vn";
import { fetchCommuneDetail } from "../services/communeFactsClient";


const DEFAULT_IDS = {
    source: "dongnai-communes" || "commune-source",
    highlight: "commune-highlight",
};

function featureBounds(f) {
    let minX = 180,
        minY = 90,
        maxX = -180,
        maxY = -90;
    const g = f.geometry;
    const polys =
        g.type === "Polygon"
            ? g.coordinates
            : g.type === "MultiPolygon"
                ? g.coordinates.flat()
                : [];
    for (const ring of polys)
        for (const [x, y] of ring) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    return [
        [minX, minY],
        [maxX, maxY],
    ];
}
function bboxCenter(b) {
    return [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2];
}

// Câu hỏi mang tính "xin thông tin / mô tả"
function isInfoQuery(text = "") {
    const n = norm(text);
    const words = n.split(/\s+/).filter(Boolean);
    if (words.length >= 4) return true;

    const TOKENS = [
        "thong tin",
        "kinh te",
        "mon an",
        "dac trung",
        "gioi thieu",
        "lich su",
        "dan so",
        "khi hau",
        "tinh hinh",
        "am thuc",
        "du lich",
        "dac diem",
    ];
    return TOKENS.some((t) => n.includes(t));
}

// Ép mọi câu hỏi đều gắn rõ phạm vi Đồng Nai mới
function scopeToDongNai(text = "") {
    if (/đồng nai|dong nai/i.test(text)) return text;
    return `${text} (trong phạm vi tỉnh Đồng Nai mới)`;
}

export function initSmartMapAI({
    mapRef,
    setSelectedPoi,
    ids = DEFAULT_IDS,
    geojsonUrl = "/data/dongnai-95-demo.geojson",
    poiUrl = "/data/pois.json",
}) {
    let communeIndexPromise = null;
    let poiListPromise = null;

    async function ensureCommuneIndex() {
        if (!communeIndexPromise)
            communeIndexPromise = loadCommuneIndex(geojsonUrl);
        return communeIndexPromise;
    }

    async function ensurePoiList() {
        if (!poiListPromise) poiListPromise = loadPoiIndex(poiUrl);
        return poiListPromise;
    }

    // ---- ĐỔ COMMUNE LÊN MAP + PANEL (Search) ----
    function selectCommuneOnMap(f, map) {
        console.log("[selectCommuneOnMap] f.properties:", f.properties);
        const p = f.properties || {};

        // id dùng để highlight theo GeoJSON property "id"
        const id = String(p.id ?? "").trim();

        // code dùng để gọi API /api/communes/:id (theo server.js đang đọc req.params.id là code)
        const code = String(p.code ?? p.id ?? "").trim();

        // geoId dùng cho state selectedPoi (ưu tiên id, fallback code)
        const geoId = String(p.id ?? code ?? "").trim();

        if (map.getLayer(ids.highlight) && id) {
            map.setFilter(ids.highlight, ["==", ["get", "id"], id]);
        }

        const fb = featureBounds(f);
        const [cx, cy] = bboxCenter(fb);
        map.fitBounds(fb, { padding: 80, duration: 900, maxZoom: 13 });

        const communeLabel = `${p.type || ""} ${p.name || ""}`.trim();
        const provinceLabel = p.province || "Tỉnh Đồng Nai mới";

        // 1) set trước base để panel hiện ngay
        const base = {
            id: geoId,
            code,
            name: p.name,
            category: "commune",
            lng: cx,
            lat: cy,
            address: [communeLabel, provinceLabel].filter(Boolean).join(", "),
            province: provinceLabel,
            images: [],
            desc: p.note || "Thông tin đang cập nhật",
        };

        setSelectedPoi(base);

        // 2) gọi API lấy fact chi tiết rồi merge vào
        if (!code) return;

        fetchCommuneDetail(code)
            .then((facts) => {
                if (!facts) return;
                setSelectedPoi((prev) => {
                    // so khớp bằng code để chắc chắn (không lệ thuộc id kiểu gì)
                    if (!prev || prev.category !== "commune" || prev.code !== code) return prev;
                    return { ...prev, ...facts };
                });
            })
            .catch((e) => console.warn("Load commune facts error:", e));
    }



    // ---- ĐỔ POI LÊN MAP + PANEL (Search) ----
    function selectPoiOnMap(poi, map) {
        const {
            lng,
            lat,
            name,
            commune,
            hamlet,
            village,
            thon,
            province,
            description,
        } = poi;

        if (lng != null && lat != null) {
            map.flyTo({ center: [lng, lat], zoom: 13, duration: 900 });
        }

        const hamletLabel = hamlet || village || thon || null;
        const provinceLabel = province || "Tỉnh Đồng Nai mới";

        const adminParts = [];
        if (hamletLabel) adminParts.push(hamletLabel);
        if (commune) adminParts.push(commune);
        adminParts.push(provinceLabel);

        setSelectedPoi({
            id: poi.id,
            name,
            category: poi.type || "poi",
            lng,
            lat,
            address: adminParts.join(", "),
            province: provinceLabel,
            images: poi.images || [],
            desc: description || "Thông tin đang cập nhật",
        });
    }

    // ==== SEARCH MODE: chỉ điều hướng, không gọi AI ====
    async function handleSearchQuery(text) {
        if (!text || !mapRef.current) return false;
        const map = mapRef.current;
        const trimmed = text.trim();
        if (!trimmed) return false;

        // 1) ưu tiên xã/phường
        try {
            const idx = await ensureCommuneIndex();
            const hit = tryExtractCommune(trimmed, idx);
            if (hit && hit.f) {
                selectCommuneOnMap(hit.f, map);
                return true;
            }
        } catch (e) {
            console.warn("Commune detect error (search mode):", e);
        }

        // 2) sau đó tới POI
        try {
            const poiList = await ensurePoiList();
            if (poiList && poiList.length > 0) {
                const poiHits = searchPoi(trimmed, poiList, 1);
                if (poiHits.length > 0) {
                    const poi = poiHits[0];
                    selectPoiOnMap(poi, map);
                    return true;
                }
            }
        } catch (e) {
            console.warn("POI detect error (search mode):", e);
        }

        // 3) không tìm được gì
        return false;
    }

    // ==== CHAT MODE: chỉ chat AI, KHÔNG dùng InfoPanel, KHÔNG zoom ====
    async function handleChatQuery(text, chatUI) {
        if (!text) return false;

        // Moderation
        const mod = await moderateText(text).catch(() => ({ allowed: true }));
        if (mod && mod.allowed === false) {
            chatUI?.push({
                role: "assistant",
                content: "Xin lỗi, nội dung này không phù hợp.",
            });
            return true;
        }

        const scoped = scopeToDongNai(text);
        const messages = [{ role: "user", content: scoped }];
        const reply = await askAI(messages);

        chatUI?.push({ role: "assistant", content: reply });
        return true;
    }

    return { handleSearchQuery, handleChatQuery };
}
