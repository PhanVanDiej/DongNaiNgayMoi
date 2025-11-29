import React from "react";

export default function BaseLayerVertical({ styleId, setBase }) {
    const items = [
        { id: "satellite", label: "Vệ tinh", icon: "fa-solid fa-globe" },
        { id: "streets", label: "Bản đồ", icon: "fa-solid fa-map" }
    ];
    return (
        <div className="absolute left-3 bottom-3 z-20 w-[240px] rounded-2xl shadow-xl ring-1 ring-black/10 overflow-hidden">
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-700/90 text-white">
                <div className="px-4 py-2 text-xs font-bold tracking-wide">LỚP PHỦ NỀN</div>
                <div className="px-2 pb-2 space-y-1">
                    {items.map((it) => (
                        <button key={it.id} onClick={() => setBase(it.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition ${styleId === it.id ? "bg-white/20 ring-1 ring-white/40" : ""}`}>
                            <i className={`${it.icon} w-5 text-base`}></i>
                            <span className="flex-1 text-[13px]">{it.label}</span>
                            {styleId === it.id && <i className="fa-solid fa-check text-xs" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
