import React, { useEffect, useState } from "react";
import TitleBG from '../assets/images/title_bg.jpg';
import DongNaiLocation from '../assets/images/dongnaimap.png';
import DongNaiHisTory from '../assets/images/dongnai_history.jpg'
// Hook gõ chữ + xoá chữ luân phiên
function useTypingLoop(phrases, typingSpeed = 70, pauseTime = 1600) {
    const [index, setIndex] = useState(0);      // câu hiện tại
    const [charIndex, setCharIndex] = useState(0); // số ký tự đã hiện
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = phrases[index] || "";
        let timeout;

        if (!isDeleting) {
            // đang gõ
            if (charIndex < current.length) {
                timeout = setTimeout(() => setCharIndex((c) => c + 1), typingSpeed);
            } else {
                // gõ xong, dừng 1 lúc rồi xoá
                timeout = setTimeout(() => setIsDeleting(true), pauseTime);
            }
        } else {
            // đang xoá
            if (charIndex > 0) {
                timeout = setTimeout(() => setCharIndex((c) => c - 1), typingSpeed / 2);
            } else {
                // xoá hết → chuyển sang câu tiếp
                setIsDeleting(false);
                setIndex((i) => (i + 1) % phrases.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [phrases, index, charIndex, isDeleting, typingSpeed, pauseTime]);

    return (phrases[index] || "").slice(0, charIndex);
}

// Nút dưới Sidebar
export function ProvinceInfoButton({ onClick, className = "" }) {
    const text = useTypingLoop(
        [
            "Bạn biết gì về tỉnh Đồng Nai mới?",
            "Nhấn để có thông tin thú vị!",
        ],
        70,
        1600
    );

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        relative w-full
        rounded-2xl px-3 py-2
        bg-sky-600 hover:bg-sky-700
        text-[11px] sm:text-xs font-medium text-white
        shadow-md overflow-hidden
        btn-shine
        ${className}
      `}
        >
            <span className="relative z-10 flex items-center justify-center gap-1">
                <i className="fa-solid fa-circle-info text-[11px] opacity-90" />
                <span className="line-clamp-2 text-center">
                    {text || ""}
                    <span className="typing-caret" />
                </span>

            </span>
        </button>
    );
}
// Có thể để trên cùng file
const PROVINCE_SECTIONS = [
    {
        id: "scale",
        label: "Quy mô & xếp hạng",
        image: null, // có thể thêm ảnh infographics sau
        content: (
            <>
                <p className="mb-1">
                    Đồng Nai là một tỉnh thuộc vùng Đông Nam Bộ, nằm trong vùng kinh tế
                    trọng điểm phía Nam.
                </p>
                <p>
                    Từ dữ liệu sắp xếp đơn vị hành chính năm 2025, tỉnh Đồng Nai mới có
                    diện tích{" "}
                    <span className="font-semibold text-sky-700">12.737 km²</span>, xếp
                    thứ{" "}
                    <span className="font-semibold text-sky-700">9</span>{" "}
                    cả nước; dân số{" "}
                    <span className="font-semibold text-sky-700">
                        4.491.408 người
                    </span>
                    , đứng thứ{" "}
                    <span className="font-semibold text-sky-700">5</span>{" "}
                    toàn quốc.
                </p>
                <p className="mt-1">
                    Năm 2024, GRDP ước đạt{" "}
                    <span className="font-semibold text-sky-700">
                        609.176.602 triệu VNĐ
                    </span>{" "}
                    (xếp thứ{" "}
                    <span className="font-semibold text-sky-700">4</span>), thu ngân sách{" "}
                    <span className="font-semibold text-sky-700">
                        73.458.454 triệu VNĐ
                    </span>{" "}
                    (xếp thứ{" "}
                    <span className="font-semibold text-sky-700">4</span>
                    ), thu nhập bình quân đầu người khoảng{" "}
                    <span className="font-semibold text-sky-700">
                        78,04 triệu VNĐ/năm
                    </span>{" "}
                    (xếp thứ{" "}
                    <span className="font-semibold text-sky-700">4</span>).
                </p>
            </>
        ),
    },
    {
        id: "position",
        label: "Vị trí địa lý & vai trò vùng",
        image: DongNaiLocation,
        content: (
            <>
                <p>
                    Đồng Nai nằm ở cửa ngõ phía Đông của Thành phố Hồ Chí Minh, trong
                    vùng kinh tế trọng điểm Nam Bộ. Tỉnh tiếp giáp:
                </p>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                    <li>
                        Phía đông giáp{" "}
                        <span className="font-semibold text-sky-700">tỉnh Lâm Đồng</span>
                    </li>
                    <li>
                        Phía tây giáp{" "}
                        <span className="font-semibold text-sky-700">
                            Thành phố Hồ Chí Minh
                        </span>{" "}
                        và{" "}
                        <span className="font-semibold text-sky-700">tỉnh Tây Ninh</span>
                    </li>
                    <li>
                        Phía nam tiếp tục giáp{" "}
                        <span className="font-semibold text-sky-700">
                            Thành phố Hồ Chí Minh
                        </span>
                    </li>
                    <li>
                        Phía bắc giáp các tỉnh{" "}
                        <span className="font-semibold text-sky-700">
                            Tbong Khmum, Kratié, Mondulkiri (Campuchia)
                        </span>
                        .
                    </li>
                </ul>
                <p className="mt-1">
                    Tỉnh giữ vai trò{" "}
                    <span className="font-semibold text-sky-700">
                        cửa ngõ kết nối Đông Nam Bộ với Tây Nguyên
                    </span>{" "}
                    và khu vực duyên hải miền Trung, là một đỉnh quan trọng trong các
                    tam giác, tứ giác phát triển quanh Thành phố Hồ Chí Minh.
                </p>
            </>
        ),
    },
    {
        id: "nature",
        label: "Điều kiện tự nhiên",
        image: null, // gợi ý: ảnh VQG Nam Cát Tiên
        content: (
            <>
                <p>
                    Địa hình Đồng Nai chuyển tiếp từ vùng trung du tới đồng bằng, có xu
                    hướng thấp dần từ{" "}
                    <span className="font-semibold text-sky-700">bắc xuống nam</span>,
                    xen kẽ các dãy núi thấp như{" "}
                    <span className="font-semibold text-sky-700">
                        núi Chứa Chan, khu vực Nam Cát Tiên
                    </span>
                    .
                </p>
                <p className="mt-1">
                    Tỉnh có quỹ đất nông – lâm nghiệp phong phú, trong đó khoảng{" "}
                    <span className="font-semibold text-sky-700">49,1%</span> diện tích
                    là đất nông nghiệp,{" "}
                    <span className="font-semibold text-sky-700">30,4%</span> là đất lâm
                    nghiệp; phần còn lại là đất chuyên dùng, khu dân cư và đất chưa sử
                    dụng.
                </p>
                <p className="mt-1">
                    Khí hậu mang tính chất{" "}
                    <span className="font-semibold text-sky-700">
                        nhiệt đới gió mùa
                    </span>{" "}
                    với hai mùa rõ rệt: mùa mưa từ{" "}
                    <span className="font-semibold text-sky-700">tháng 5–11</span>, mùa
                    khô từ{" "}
                    <span className="font-semibold text-sky-700">tháng 12–4</span>. Nhiệt
                    độ trung bình năm khoảng{" "}
                    <span className="font-semibold text-sky-700">25–27°C</span>, số giờ
                    nắng{" "}
                    <span className="font-semibold text-sky-700">
                        2.500–2.700 giờ/năm
                    </span>{" "}
                    và độ ẩm trung bình{" "}
                    <span className="font-semibold text-sky-700">80–82%</span>.
                </p>
                <p className="mt-1">
                    Rừng Đồng Nai mang đặc trưng rừng nhiệt đới, tiêu biểu là{" "}
                    <span className="font-semibold text-sky-700">
                        Vườn quốc gia Nam Cát Tiên
                    </span>{" "}
                    với đa dạng sinh học cao, cùng nguồn khoáng sản như đá xây dựng, vật
                    liệu gốm sứ, nước khoáng,...
                </p>
            </>
        ),
    },
    {
        id: "history",
        label: "Lịch sử hình thành",
        image: DongNaiHisTory,
        content: (
            <>
                <p>
                    Vùng đất Đồng Nai có dấu vết cư trú của con người từ rất sớm, với các
                    di tích thuộc{" "}
                    <span className="font-semibold text-sky-700">
                        thời kỳ đồ đá cũ
                    </span>{" "}
                    và nền văn hoá Đồng Nai xuất hiện cách đây hơn{" "}
                    <span className="font-semibold text-sky-700">4.000 năm</span>.
                </p>
                <p className="mt-1">
                    Thời Nam tiến, đây là vùng đất được lưu dân người Việt và thương
                    nhân người Hoa đến khai phá mạnh mẽ. Năm{" "}
                    <span className="font-semibold text-sky-700">1698</span>, Lễ Thành
                    Hầu Nguyễn Hữu Cảnh kinh lược phương Nam, đặt phủ Gia Định, lập dinh
                    Trấn Biên – tiền thân của tỉnh Biên Hoà và vùng Đông Nam Bộ ngày
                    nay.
                </p>
                <p className="mt-1">
                    Sau nhiều lần điều chỉnh địa giới qua các thời kỳ, đến năm{" "}
                    <span className="font-semibold text-sky-700">1975</span> ba tỉnh Biên
                    Hòa, Long Khánh, Phước Tuy được hợp nhất thành tỉnh Đồng Nai. Năm{" "}
                    <span className="font-semibold text-sky-700">2019</span>, Long Khánh
                    trở thành thành phố thứ hai của tỉnh.
                </p>
                <p className="mt-1">
                    Bước ngoặt mới là{" "}
                    <span className="font-semibold text-sky-700">Nghị quyết số 202/2025/QH15</span>{" "}
                    ngày 12/6/2025, sáp nhập tỉnh Bình Phước vào tỉnh Đồng Nai, hình
                    thành{" "}
                    <span className="font-semibold text-sky-700">
                        tỉnh Đồng Nai mới với 12.737,18 km² và 4.491.408 người
                    </span>
                    .
                </p>
            </>
        ),
    },
    {
        id: "admin",
        label: "Tổ chức hành chính",
        image: null,
        content: (
            <>
                <p>
                    Sau sắp xếp năm 2025, Đồng Nai có{" "}
                    <span className="font-semibold text-sky-700">
                        95 đơn vị hành chính cấp xã
                    </span>
                    , gồm{" "}
                    <span className="font-semibold text-sky-700">23 phường</span> và{" "}
                    <span className="font-semibold text-sky-700">72 xã</span>.
                </p>
                <p className="mt-1">
                    Trung tâm hành chính là{" "}
                    <span className="font-semibold text-sky-700">
                        thành phố Biên Hòa
                    </span>
                    , cách Thành phố Hồ Chí Minh khoảng{" "}
                    <span className="font-semibold text-sky-700">30 km</span> và cách Hà
                    Nội khoảng{" "}
                    <span className="font-semibold text-sky-700">1.684 km</span> theo
                    Quốc lộ 1. Đây là thành phố trực thuộc tỉnh có dân số lớn hàng đầu
                    cả nước.
                </p>
            </>
        ),
    },
    {
        id: "economy",
        label: "Kinh tế & công nghiệp",
        image: null, // ảnh KCN / nhà máy
        content: (
            <>
                <p>
                    Đồng Nai là một trong những cực tăng trưởng công nghiệp quan trọng
                    của cả nước, thuộc nhóm dẫn đầu về{" "}
                    <span className="font-semibold text-sky-700">
                        GRDP và thu ngân sách
                    </span>
                    .
                </p>
                <p className="mt-1">
                    Tỉnh có hơn{" "}
                    <span className="font-semibold text-sky-700">
                        30 khu công nghiệp
                    </span>{" "}
                    được phê duyệt và đi vào hoạt động, như Biên Hòa II, Amata, Nhơn
                    Trạch, Long Thành..., cùng hàng loạt cụm công nghiệp nghề truyền
                    thống.
                </p>
                <p className="mt-1">
                    Nông nghiệp vẫn giữ vai trò quan trọng với các vùng chuyên canh{" "}
                    <span className="font-semibold text-sky-700">
                        cà phê, cao su, cây ăn trái, chăn nuôi heo và bò
                    </span>
                    , cung cấp khối lượng nông sản lớn cho cả vùng Đông Nam Bộ và xuất
                    khẩu.
                </p>
            </>
        ),
    },
    {
        id: "society",
        label: "Dân cư & xã hội",
        image: null,
        content: (
            <>
                <p>
                    Đồng Nai là một trong những tỉnh đông dân nhất phía Nam với trên{" "}
                    <span className="font-semibold text-sky-700">4,4 triệu người</span>{" "}
                    sau sáp nhập. Trước năm 2025, dân số đã đạt hơn{" "}
                    <span className="font-semibold text-sky-700">3,09 triệu</span> (năm
                    2019).
                </p>
                <p className="mt-1">
                    Đây là địa bàn đa dân tộc, đa tôn giáo, trong đó{" "}
                    <span className="font-semibold text-sky-700">
                        Công giáo và Phật giáo
                    </span>{" "}
                    có số lượng tín đồ lớn. Nhiều cộng đồng tôn giáo, tín ngưỡng khác
                    cùng chung sống, tạo nên đời sống văn hoá phong phú.
                </p>
            </>
        ),
    },
    {
        id: "transport",
        label: "Giao thông & kết nối vùng",
        image: null, // ảnh cao tốc / Long Thành
        content: (
            <>
                <p>
                    Đồng Nai sở hữu hệ thống giao thông chiến lược với các tuyến{" "}
                    <span className="font-semibold text-sky-700">
                        Quốc lộ 1, 13, 20, 51, 56
                    </span>
                    , tuyến{" "}
                    <span className="font-semibold text-sky-700">
                        đường sắt Bắc–Nam dài ~87,5 km
                    </span>{" "}
                    đi qua cùng các tuyến cao tốc và vành đai đang xây dựng.
                </p>
                <p className="mt-1">
                    <span className="font-semibold text-sky-700">
                        Cảng hàng không quốc tế Long Thành
                    </span>{" "}
                    được định hướng là cửa ngõ hàng không quan trọng của Việt Nam và khu
                    vực. Hệ thống cảng sông trên sông Đồng Nai, Nhà Bè – Lòng Tàu, Thị
                    Vải giúp Đồng Nai trở thành điểm trung chuyển hàng hoá lớn của vùng.
                </p>
            </>
        ),
    },
];


// Overlay thông tin tỉnh
export function ProvinceInfoOverlay({ open, onClose, onAskAssistant }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="
          relative
          w-[min(100%,720px)] max-w-3xl mx-4
          rounded-2xl bg-white shadow-2xl
          p-5 sm:p-6
          max-h-[80vh] overflow-y-auto
        "
                onClick={(e) => e.stopPropagation()}
            >
                {/* nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                    title="Đóng"
                >
                    ×
                </button>

                {/* BANNER ẢNH TRÊN CÙNG */}
                <div className="relative -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 sm:mb-5 h-32 sm:h-40 overflow-hidden rounded-t-2xl">
                    {/* Đặt file ở public/asset/images/title_bg.jpg → src="/asset/images/title_bg.jpg" */}
                    <img
                        src={TitleBG}
                        alt="Đồng Nai ngày mới"
                        className="w-full h-full object-cover"
                    />
                    {/* lớp gradient cho giống style card game */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
                </div>

                {/* LOGO + TIÊU ĐỀ, logo đứng trước tiêu đề */}
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    {/* logo trang – thay đường dẫn nếu bạn có logo khác */}
                    <img
                        src="/logo.png"
                        alt="Logo Đồng Nai ngày mới"
                        className="w-10 h-10 sm:w-11 sm:h-11 "
                    />
                    <div>
                        <div className="text-[11px] sm:text-xs uppercase tracking-wide text-sky-500 font-semibold">
                            Bản đồ số · Thông tin tỉnh
                        </div>
                        <h2 className="text-lg sm:text-2xl font-semibold text-sky-700 drop-shadow-sm">
                            Đồng Nai ngày mới
                        </h2>
                    </div>
                </div>

                {/* đoạn mở đầu */}
                <p className="text-sm sm:text-[15px] text-gray-100/90 sm:text-gray-700 mb-4 leading-relaxed">
                    Theo nghị quyết về sắp xếp các đơn vị hành chính năm 2025, tỉnh Đồng Nai
                    mới được hình thành trên cơ sở sáp nhập toàn bộ diện tích tự nhiên và dân
                    số của tỉnh Đồng Nai cũ và tỉnh Bình Phước. Việc sáp nhập này không chỉ
                    mang ý nghĩa hành chính đơn thuần, mà còn mở ra cơ hội tổ chức lại không
                    gian phát triển, kết nối hạ tầng và khai thác tốt hơn tiềm năng của cả
                    vùng.
                </p>

                {/* DANH SÁCH CÁC MỤC */}
                <div className="space-y-4 sm:space-y-5">
                    {PROVINCE_SECTIONS.map((item) => (
                        <section key={item.id}>
                            <div className="text-sm sm:text-[20px] font-semibold text-sky-700 mb-1.5">
                                {item.label}
                            </div>

                            {item.image && (
                                <div className="mb-2">
                                    <img
                                        src={item.image}
                                        alt={item.label}
                                        className="w-full max-h-40 object-cover rounded-lg shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="text-[13px] sm:text-sm text-gray-800 leading-relaxed">
                                {item.content}
                            </div>
                        </section>
                    ))}
                </div>


                {/* Hàng cuối: hỏi thêm + nút trợ lí */}
                <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                    <span className="text-gray-700 font-medium">
                        Bạn muốn biết nhiều hơn?
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            // đóng overlay
                            onClose?.();
                            // gọi ra ngoài để mở + focus ChatDock
                            onAskAssistant?.();
                        }}
                        className="
                            inline-flex items-center gap-2
                            px-3 py-1.5 rounded-full
                            bg-sky-600 hover:bg-sky-700
                            text-white text-xs sm:text-sm
                            shadow-md">
                        <i className="fa-solid fa-robot text-xs" />
                        <span>Thử hỏi trợ lí thông minh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

