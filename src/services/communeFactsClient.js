// src/services/communeFactsClient.js
const API_BASE = "/api";

let indexCache = null;
const detailCache = new Map();

export async function fetchCommuneIndex() {
    if (indexCache) return indexCache;
    const res = await fetch(`${API_BASE}/communes`);
    if (!res.ok) {
        console.warn("Không load được /api/communes");
        indexCache = {};
        return indexCache;
    }
    indexCache = await res.json();
    return indexCache;
}

export async function fetchCommuneDetail(id) {
    if (!id) return null;
    if (detailCache.has(id)) return detailCache.get(id);

    const res = await fetch(`${API_BASE}/communes/${id}`);
    if (!res.ok) {
        console.warn("Không load được /api/communes/" + id);
        detailCache.set(id, null);
        return null;
    }
    const data = await res.json();
    detailCache.set(id, data);
    return data;
}
