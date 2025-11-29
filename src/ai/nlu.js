// ai/nlu.js
import { norm } from "../utils/vn";
import { findCommuneByText } from "../services/communeIndex";

const NAVI_HINTS = [
    "tim", "tìm", "den", "đến", "toi", "tới", "zoom", "mo", "mở", "chi duong", "đưa tôi tới",
    "xa", "phuong", "thị trấn", "thi tran", "p.", "x."
];

export function localClassify(text) {
    const n = norm(text);

    // 1) có chứa từ gợi ý điều hướng -> NAVIGATE_COMMUNE
    const isAskPlace =
        NAVI_HINTS.some((k) => n.includes(k)) ||
        /\b(xa|xã|phuong|phường|thi tran|thị trấn|p\.|x\.)\b/.test(n);

    if (isAskPlace) return "NAVIGATE_COMMUNE";

    // 2) heuristic: nếu câu RẤT NGẮN (≤3 từ) -> khả năng cao là tên địa danh
    const words = n.split(/\s+/).filter(Boolean);
    if (words.length > 0 && words.length <= 3) {
        return "NAVIGATE_COMMUNE";
    }

    // 3) còn lại coi là câu hỏi thông tin chung
    return "QA_OTHER";
}

export function tryExtractCommune(text, index) {
    const n = norm(text).trim();

    // 1) Ưu tiên pattern: "... xa/phuong/thi tran <ten> (ở CUỐI câu)"
    // Ví dụ:
    //  - "toi muon biet them thong tin ve xa phu ly"
    //  - "kinh te xa bu dang"
    //  => match group[2] = "phu ly", "bu dang"
    let q = n;
    const m = n.match(/\b(xa|phuong|thi tran)\s+([a-z0-9\s]+)$/);
    if (m && m[2]) {
        q = m[2].trim();
    }

    // 2) Nếu không match, q vẫn = toàn bộ chuỗi n
    //    -> dùng cho case ngắn kiểu "bu dang", "phu ly"
    const hit = findCommuneByText(q, index);
    return hit; // { id, name, type, district, f } | null
}
