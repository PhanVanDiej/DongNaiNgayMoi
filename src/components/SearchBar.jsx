// src/components/SearchBar.jsx
import React, { useEffect, useState } from "react";

export default function SearchBar({ onSearch, speech }) {
    const [q, setQ] = useState("");

    useEffect(() => {
        if (speech?.transcript) {
            setQ(speech.transcript);
            onSearch?.(speech.transcript, { source: "voice" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speech?.transcript]);

    const handleSearchClick = () => {
        const text = q.trim();
        if (!text) return;
        onSearch?.(text, { source: "text" });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearchClick();
    };

    return (
        <div className="absolute top-3 left-1/2 -translate-x-[55%] z-20 w-full max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur shadow-xl ring-1 ring-black/5 p-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tìm xã/phường, công trình… (gõ hoặc bấm mic)"
                    className="flex-1 bg-transparent outline-none px-3 py-2 text-sm"
                />
                {speech?.supported && (
                    <button
                        onClick={speech.start}
                        className={`px-3 py-2 rounded-xl text-sm ${speech.listening
                                ? "bg-rose-600 text-white"
                                : "bg-gray-900 text-white hover:bg-black"
                            }`}
                        title="Tìm bằng giọng nói"
                    >
                        {speech.listening ? "Đang nghe…" : "🎙️ Mic"}
                    </button>
                )}
                <button
                    onClick={handleSearchClick}
                    className="px-4 py-2 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-700/90 text-white text-sm hover:bg-emerald-700"
                >
                    Tìm kiếm
                </button>
            </div>
        </div>
    );
}
