// services/communeIndex.js
import { norm, stripVN } from "../utils/vn";

let _cache = null;

export async function loadCommuneIndex(url = "/data/dongnai-95.geojson") {
    if (_cache) return _cache;
    const res = await fetch(url);
    const fc = await res.json();

    const list = (fc.features || []).map(f => {
        const p = f.properties || {};
        // Bảo đảm schema tối thiểu
        const id = p.id ?? p.MA_XA ?? p.ma_xa ?? crypto.randomUUID();
        const name = p.name ?? p.TEN_XA ?? p.TEN ?? "";
        const type = p.type ?? p.LOAI ?? p.cap_xa ?? "";
        const district = p.district ?? p.HUYEN ?? p.huyen ?? "";
        const n = norm(name);
        return { id, name, type, district, n, f };
    });

    // map theo tên đã chuẩn hóa (kèm alias "xa ", "phuong ")
    const byName = new Map();
    for (const it of list) {
        byName.set(it.n, it);
        byName.set(norm(`${it.type} ${it.name}`), it);
        byName.set(norm(`${it.name} ${it.district}`), it);
    }
    const debugFeature = fc.features.find(
        f => f.properties.name === "Xã Bù Đăng"
    );
    console.log("[communeIndex] Bù Đăng feature:", debugFeature?.properties);


    _cache = { list, byName, fc };
    return _cache;
}

export function findCommuneByText(text, index) {
    if (!text || !index) return null;

    // 1) chuẩn hóa + bỏ dấu
    let q = norm(text);

    // 2) bỏ dấu câu, ký tự rác: ".", ",", "?", "!"...
    q = q
        .replace(/[.,!?;:()[\]"'“”‘’…]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // 3) bỏ các prefix như "xã", "phường", "thị trấn", "p.", "x."
    q = q
        .replace(
            /\b(xa|phuong|phường|thi tran|thị trấn|thi xa|thị xã|p\.?|x\.?)\b/g,
            ""
        )
        .replace(/\s+/g, " ")
        .trim();

    if (!q) return null;

    // 1) match đầy đủ theo byName (đã có các key "xa bu dang", "phuong tan hiep"...)
    if (index.byName.has(q)) return index.byName.get(q);

    // 2) ưu tiên tên bắt đầu bằng q
    const starts = index.list.find((it) => it.n.startsWith(q));
    if (starts) return starts;

    // 3) rồi mới contains
    const contains = index.list.find((it) => it.n.includes(q));
    if (contains) return contains;

    // 4) fallback khoảng cách ký tự (Levenshtein nhẹ)
    const dist = (a, b) => {
        const m = a.length,
            n = b.length;
        const dp = Array.from({ length: m + 1 }, () =>
            Array(n + 1).fill(0)
        );
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++)
            for (let j = 1; j <= n; j++) {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
        return dp[m][n];
    };

    let best = null,
        bestD = Infinity;
    for (const it of index.list) {
        const d = dist(q, it.n);
        if (d < bestD) {
            bestD = d;
            best = it;
        }
    }

    const maxAllowed = Math.max(2, Math.floor(q.length * 0.25));
    return bestD <= maxAllowed ? best : null;
}
