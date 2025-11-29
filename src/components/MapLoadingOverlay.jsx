// src/components/MapLoadingOverlay.jsx
import React from "react";

export default function MapLoadingOverlay() {
    return (
        <div
            className="fixed inset-0 z-30 flex flex-col items-center justify-center text-white"
            style={{
                backgroundImage: 'url("/public/loading_img.jpg")',
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* vòng tròn loading */}
            <div className="w-12 h-12 border-4 border-white/40 border-t-white rounded-full animate-spin mb-4" />

            <p className="text-sm md:text-base font-medium drop-shadow">
                Bản đồ Đồng Nai đang được tải, vui lòng chờ trong giây lát...
            </p>
        </div>
    );
}
