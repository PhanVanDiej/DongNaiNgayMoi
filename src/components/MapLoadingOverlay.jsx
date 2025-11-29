// src/components/MapLoadingOverlay.jsx
import React from "react";

// 👉 import ảnh trực tiếp để Vite bundle path đúng trong dist
import loadingBg from '../../public/loading_img.jpg';

export default function MapLoadingOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Lớp nền ảnh full màn hình */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${loadingBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(0.85)",
                }}
            />

            {/* Lớp mờ + nội dung load */}
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                <div className="w-12 h-12 border-4 border-white/40 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-sm md:text-base font-medium drop-shadow">
                    Bản đồ Đồng Nai đang được tải, vui lòng chờ trong giây lát...
                </p>
            </div>
        </div>
    );
}
