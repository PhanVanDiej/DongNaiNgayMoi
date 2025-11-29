// src/services/poiIndex.js
// Đọc /data/pois.json và cho phép search đơn giản theo name/aliases

import { norm } from "../utils/vn";

let poiIndexPromise = null;

export async function loadPoiIndex(url = "/data/pois.json") {
    if (!poiIndexPromise) {
        poiIndexPromise = fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Không tải được pois.json");
                return res.json();
            })
            .catch((e) => {
                console.warn("⚠️ Không load được POI index:", e);
                return [];
            });
    }
    return poiIndexPromise; // array các poi
}

/**/
export function searchPoi(text, poiList, limit = 3) {
    if (!text || !poiList || poiList.length === 0) return [];

    const q = norm(text); // đã lower + bỏ dấu

    const matches = [];
    for (const poi of poiList) {
        // lấy name + aliases, bỏ null/undefined
        const fields = [poi.name, ...(poi.aliases || [])].filter(Boolean);

        // so sánh CHÍNH XÁC sau khi norm (không còn includes)
        const hasMatch = fields.some((f) => norm(f) === q);

        if (hasMatch) {
            matches.push(poi);
            if (matches.length >= limit) break;
        }
    }
    return matches;
}

