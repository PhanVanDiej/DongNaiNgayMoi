// utils/vn.js
export function stripVN(s = "") {
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D");
}
export function norm(s = "") {
    return stripVN(s).toLowerCase().replace(/\s+/g, " ").trim();
}
