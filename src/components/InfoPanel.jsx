// src/components/InfoPanel.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ===== Helpers =====
const fmtNum = (n) =>
    typeof n === "number" ? n.toLocaleString("vi-VN") : n ?? "";
const fmtArea = (n) =>
    typeof n === "number"
        ? n.toLocaleString("vi-VN", { maximumFractionDigits: 2 })
        : n ?? "";
const A = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// Base URL cho ảnh commune
const COMMUNE_IMAGE_BASE =
    (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_COMMUNE_IMAGE_BASE) ||
    "/images/communes";

function buildCommuneImageUrl(communeId, filename) {
    if (!filename) return null;
    // Nếu đã là URL đầy đủ hoặc path tuyệt đối thì giữ nguyên
    if (/^https?:\/\//i.test(filename) || filename.startsWith("/")) return filename;

    const base = String(COMMUNE_IMAGE_BASE || "").replace(/\/$/, "");
    const id = String(communeId || "").trim();
    if (!id) return `${base}/${filename}`;
    return `${base}/${id}/${filename}`;
}

function Stat({ icon, label, value, tone = "blue" }) {
    const tones = {
        blue: "bg-blue-50 text-blue-700 ring-blue-200",
        green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
    const t = tones[tone] || tones.blue;
    return (
        <div className={`p-3 rounded-xl ring-1 ${t}`}>
            <div className="flex items-center gap-2 text-xs opacity-80">
                <i className={`fa-solid ${icon}`} />
                <span>{label}</span>
            </div>
            <div className="mt-1 text-2xl font-semibold">{value ?? "—"}</div>
        </div>
    );
}

function Section({ icon, title, children }) {
    return (
        <div className="mt-4">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <i className={`fa-solid ${icon} w-4 text-gray-700`} />
                <span>{title}</span>
            </div>
            <div className="space-y-2 text-[13px] text-gray-800">{children}</div>
        </div>
    );
}

function Chips({ items }) {
    const list = A(items);
    if (!list.length) return <div className="text-gray-500">—</div>;
    return (
        <div className="flex flex-wrap gap-2">
            {list.map((it, i) => (
                <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-[12px] bg-gray-100 ring-1 ring-gray-200"
                >
                    {it}
                </span>
            ))}
        </div>
    );
}

export default function InfoPanel({
    poi,
    onClose,
    tts,
    autoReadPending,
    onAutoReadDone,
}) {
    // luôn khai báo hooks trước, không return sớm
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Preview ảnh full-screen
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    // 1) effect load detail commune
    useEffect(() => {
        //console.log("[InfoPanel] poi changed:", poi);
        // Nếu không phải commune thì clear detail và thoát
        if (!poi || poi.__isChat || poi.category !== "commune") {
            setDetail(null);
            setLoadingDetail(false);
            return;
        }

        const communeId = poi.code || poi.id; // 👈 ưu tiên dùng code

        if (!communeId) {
            setDetail(null);
            setLoadingDetail(false);
            return;
        }

        let cancelled = false;

        async function loadDetail() {
            try {
                setLoadingDetail(true);
                const res = await fetch(`/api/communes/${communeId}`);
                if (!res.ok) {
                    console.warn("Không load được /api/communes/", poi.id, res.status);
                    if (!cancelled) setDetail(null);
                    return;
                }
                const json = await res.json();
                if (!cancelled) setDetail(json);
            } catch (e) {
                console.warn("Commune detail fetch error:", e);
                if (!cancelled) setDetail(null);
            } finally {
                if (!cancelled) setLoadingDetail(false);
            }
        }

        loadDetail();
        return () => {
            cancelled = true;
        };
    }, [poi]); // chỉ cần phụ thuộc poi

    // 2) merge data hiển thị
    const data =
        poi && poi.category === "commune" && detail ? { ...poi, ...detail } : poi;
    if (data.category === "commune") {
        console.log("[InfoPanel commune data]", {
            id: data.id,
            code: data.code,
            name: data.name,
            images: data.images,
        });
    }

    // nếu vì lý do gì đó vẫn chưa có data, cho ẩn panel
    if (!data) return null;

    const isChatMode = data.__isChat === true;
    const isCommuneMode = data.category === "commune";

    // ===== 2) Text-to-speech cho CHAT mode =====
    const canSpeak = isChatMode && tts?.supported && data.reply;

    useEffect(() => {
        if (!canSpeak || !autoReadPending) return;
        tts.speak(data.reply);
        onAutoReadDone?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSpeak, autoReadPending, data?.reply]);

    const handleToggleSpeak = () => {
        if (!canSpeak) return;
        if (tts.speaking) tts.stop();
        else tts.speak(data.reply);
    };

    // ===== Hình ảnh: dùng cấu trúc images[] mới =====
    let imageUrls = [];

    if (!isChatMode) {
        if (isCommuneMode) {
            // Commune: images là file name, trong đó có 1 file cover.* cần đưa lên đầu
            let filenames = A(data.images)
                .map((fn) => (fn != null ? String(fn) : ""))
                .filter((fn) => fn.trim().length > 0);

            if (filenames.length) {
                // tìm file cover (cover.jpg / cover.png / cover_something.*, v.v.)
                let coverIndex = filenames.findIndex((fn) => {
                    const lower = fn.toLowerCase();
                    // ưu tiên tên dạng cover.*, hoặc bắt đầu bằng cover-
                    return (
                        /^cover(\.[a-z0-9]+)?$/i.test(lower) ||
                        lower.startsWith("cover.")
                    );
                });

                if (coverIndex === -1) {
                    // fallback nhẹ: file nào chứa chữ "cover"
                    coverIndex = filenames.findIndex((fn) =>
                        fn.toLowerCase().includes("cover")
                    );
                }

                if (coverIndex > 0) {
                    const [cover] = filenames.splice(coverIndex, 1);
                    filenames = [cover, ...filenames];
                }

                imageUrls = filenames
                    .map((fn) => buildCommuneImageUrl(data.id, fn))
                    .filter(Boolean);
            }
        } else {
            // POI / loại khác: images/coverImage đã là URL/path sẵn
            const raw = A(data.images);
            if (raw.length) imageUrls = raw;
            else if (data.coverImage) imageUrls = [data.coverImage];
        }
    }

    const hasImages = !isChatMode && imageUrls.length > 0;
    const coverUrl = hasImages ? imageUrls[0] : null;
    const extraCount =
        isCommuneMode && imageUrls.length > 1 ? imageUrls.length - 1 : 0;

    const openPreviewAt = (idx) => {
        if (!hasImages) return;
        setPreviewIndex(idx);
        setPreviewOpen(true);
    };

    const closePreview = () => setPreviewOpen(false);

    const showPrev = (e) => {
        e.stopPropagation();
        if (!hasImages || imageUrls.length <= 1) return;
        setPreviewIndex((prev) =>
            prev - 1 < 0 ? imageUrls.length - 1 : prev - 1
        );
    };

    const showNext = (e) => {
        e.stopPropagation();
        if (!hasImages || imageUrls.length <= 1) return;
        setPreviewIndex((prev) =>
            prev + 1 >= imageUrls.length ? 0 : prev + 1
        );
    };

    return (
        <>
            <aside className="absolute right-3 top-3 z-20 w-[380px] md:w-[420px] max-h-[90vh] overflow-auto rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-sky-700 to-sky-600 text-white rounded-t-2xl">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div>
                            <div className="text-[12px] opacity-80">
                                {isChatMode
                                    ? "Chat Đồng Nai"
                                    : isCommuneMode
                                        ? "Đơn vị hành chính"
                                        : "Địa điểm"}
                            </div>
                            <h3 className="text-lg font-semibold">{data.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {canSpeak && (
                                <button
                                    onClick={handleToggleSpeak}
                                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1"
                                    title="Đọc nội dung trả lời"
                                >
                                    <span>{tts.speaking ? "⏹ Dừng" : "🔊 Nghe"}</span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm"
                                title="Đóng"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner ảnh cover */}
                {hasImages && (
                    <div className="relative">
                        <img
                            src={coverUrl}
                            alt={data.name}
                            className="w-full h-40 object-cover cursor-pointer"
                            onClick={() => openPreviewAt(0)}
                        />
                        {/* Badge số ảnh thêm – chỉ cho commune */}
                        {extraCount > 0 && (
                            <div className="absolute right-3 top-3 bg-black/65 text-white text-[11px] px-2 py-1 rounded-full">
                                +{extraCount} ảnh
                            </div>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-4">
                    {/* === CHAT MODE === */}
                    {isChatMode && (
                        <div className="text-[14px] leading-relaxed text-gray-900 space-y-2">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h3: ({ children }) => (
                                        <h3 className="text-sm font-semibold text-gray-800 mt-2 mb-1">
                                            {children}
                                        </h3>
                                    ),
                                    h4: ({ children }) => (
                                        <h4 className="text-[13px] font-semibold text-gray-800 mt-2 mb-1">
                                            {children}
                                        </h4>
                                    ),
                                    p: ({ children }) => <p className="mt-1">{children}</p>,
                                    ul: ({ children }) => (
                                        <ul className="list-disc ml-5 space-y-1">{children}</ul>
                                    ),
                                    li: ({ children }) => <li>{children}</li>,
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-gray-900">
                                            {children}
                                        </strong>
                                    ),
                                }}
                            >
                                {data.reply}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* === COMMUNE MODE === */}
                    {!isChatMode && isCommuneMode && (
                        <>
                            {/* dòng meta nhỏ */}
                            <div className="text-[12px] text-gray-500">
                                {data.established && (
                                    <>
                                        Thành lập: <b>{data.established}</b> ·{" "}
                                    </>
                                )}
                                <>Thuộc: {data.province || "Tỉnh Đồng Nai mới"}</>
                            </div>

                            {/* stats */}
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <Stat
                                    icon="fa-people-group"
                                    label="Dân số"
                                    value={fmtNum(data.population)}
                                    tone="blue"
                                />
                                <Stat
                                    icon="fa-vector-square"
                                    label="Diện tích (km²)"
                                    value={fmtArea(data.area_km2)}
                                    tone="green"
                                />
                            </div>

                            {/* hành chính */}
                            <Section icon="fa-location-dot" title="Trung tâm hành chính">
                                <div className="px-3 py-2 rounded-lg bg-gray-50 ring-1 ring-gray-200">
                                    {data.admin_center || "—"}
                                </div>
                            </Section>

                            {/* lãnh đạo */}
                            <Section icon="fa-user-tie" title="Lãnh đạo">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="px-3 py-2 rounded-lg bg-white ring-1 ring-gray-200">
                                        <div className="text-[12px] text-gray-500">
                                            Bí thư Đảng uỷ
                                        </div>
                                        <div className="font-medium">
                                            {data.leaders?.partySecretary || "—"}
                                        </div>
                                    </div>
                                    <div className="px-3 py-2 rounded-lg bg-white ring-1 ring-gray-200">
                                        <div className="text-[12px] text-gray-500">
                                            Chủ tịch UBND
                                        </div>
                                        <div className="font-medium">
                                            {data.leaders?.chairman || "—"}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* thiên nhiên */}
                            <Section icon="fa-seedling" title="Thiên nhiên">
                                {A(data.nature).length ? (
                                    <ul className="list-disc ml-5 space-y-1">
                                        {A(data.nature).map((t, i) => (
                                            <li key={i}>{t}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-500">
                                        {loadingDetail ? "Đang tải dữ liệu..." : "—"}
                                    </div>
                                )}
                            </Section>

                            {/* giao thông, dự án, KCN/KDC, tiếp giáp */}
                            <Section icon="fa-road" title="Tuyến giao thông huyết mạch">
                                <Chips items={data.arteries} />
                            </Section>

                            <Section icon="fa-diagram-project" title="Các dự án trọng điểm">
                                <Chips items={data.key_projects} />
                            </Section>

                            <Section icon="fa-industry" title="Khu CN & Khu dân cư">
                                <Chips items={data.industry_residential} />
                            </Section>

                            <Section icon="fa-border-all" title="Đơn vị tiếp giáp">
                                <Chips items={data.adjacent} />
                            </Section>

                            {/* du lịch – ẩm thực */}
                            <Section icon="fa-location-pin" title="Điểm đến tiêu biểu">
                                <Chips items={data.highlights} />
                            </Section>

                            <Section icon="fa-bowl-food" title="Món ăn nổi tiếng">
                                <Chips items={data.specialties} />
                            </Section>

                            {/* tọa độ + cập nhật */}
                            <div className="mt-4 text-[12px] text-gray-500">
                                {data.lat != null && data.lng != null && (
                                    <>
                                        ({data.lat?.toFixed?.(5)}, {data.lng?.toFixed?.(5)}) ·{" "}
                                    </>
                                )}
                                {data.updatedAt && <>Cập nhật: {data.updatedAt}</>}
                            </div>
                        </>
                    )}

                    {/* === POI MODE (cũ) === */}
                    {!isChatMode && !isCommuneMode && (
                        <>
                            {data.address && (
                                <Section icon="fa-map" title="Địa chỉ">
                                    <div className="px-3 py-2 rounded-lg bg-gray-50 ring-1 ring-gray-200">
                                        {data.address}
                                    </div>
                                </Section>
                            )}
                            {data.desc && (
                                <Section icon="fa-circle-info" title="Mô tả">
                                    <div>{data.desc}</div>
                                </Section>
                            )}
                            <div className="mt-3 text-[12px] text-gray-500">
                                ({data.lat?.toFixed?.(5)}, {data.lng?.toFixed?.(5)})
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* ===== Overlay preview ảnh full-screen ===== */}
            {previewOpen && hasImages && (
                <div
                    className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center"
                    onClick={closePreview}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={imageUrls[previewIndex]}
                            alt={data.name}
                            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl bg-black/20"
                        />

                        {/* Close button */}
                        <button
                            onClick={closePreview}
                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center text-lg"
                            title="Đóng"
                        >
                            ×
                        </button>

                        {/* Prev / Next */}
                        {imageUrls.length > 1 && (
                            <>
                                <button
                                    onClick={showPrev}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center"
                                    title="Ảnh trước"
                                >
                                    <i className="fa-solid fa-chevron-left" />
                                </button>
                                <button
                                    onClick={showNext}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center"
                                    title="Ảnh tiếp theo"
                                >
                                    <i className="fa-solid fa-chevron-right" />
                                </button>

                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-white/80 bg-black/50 px-3 py-1 rounded-full">
                                    {previewIndex + 1} / {imageUrls.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
