// src/components/SidebarSlim.jsx
import React, { useState } from "react";

export default function SidebarSlim({
    activeCat,        // string | null
    onSelectCat,      // (id) => void
    resetCamera,
    onClear,
}) {
    const items = [
        { id: "school", label: "Trường học", icon: "fa-solid fa-school" },
        { id: "hospital", label: "Bệnh viện", icon: "fa-solid fa-hospital" },
        { id: "market", label: "Chợ", icon: "fa-solid fa-store" },
        { id: "fuel", label: "Cây xăng", icon: "fa-solid fa-gas-pump" },
        { id: "tourism", label: "Du lịch", icon: "fa-solid fa-umbrella-beach" },
    ];
    const [open, setOpen] = useState(true);

    return (
        <div className="absolute left-3 top-3 z-20 w-[240px] rounded-2xl shadow-xl ring-1 ring-black/10 overflow-hidden">
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-700/90 text-white">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-xs font-bold tracking-wide">BỘ LỌC</div>
                    <button
                        className="text-white/80 hover:text-white text-sm"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Toggle sidebar"
                    >
                        <i
                            className={`fa-solid ${open ? "fa-chevron-up" : "fa-chevron-down"
                                }`}
                        ></i>
                    </button>
                </div>
                {open && (
                    <div className="px-2 pb-2 space-y-1">
                        {items.map((it) => {
                            const active = activeCat === it.id;
                            return (
                                <button
                                    key={it.id}
                                    onClick={() => onSelectCat(it.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition ${active ? "bg-white/20 ring-1 ring-white/40" : ""
                                        }`}
                                >
                                    <i className={`${it.icon} w-5 text-base`}></i>
                                    <span className="flex-1 text-[13px]">{it.label}</span>
                                    {active && <i className="fa-solid fa-check text-xs" />}
                                </button>
                            );
                        })}
                        <div className="pt-2 flex justify-between gap-2">
                            <button
                                onClick={resetCamera}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/50 text-xs"
                            >
                                Reset map
                            </button>
                            <button
                                onClick={onClear}
                                className="px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-xs"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
