// src/hooks/useSpeechRecognition.js
import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition({ lang = "vi-VN" } = {}) {
    const [supported, setSupported] = useState(false);
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const recognitionRef = useRef(null);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setSupported(false);
            return;
        }

        const rec = new SR();
        rec.lang = lang;
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
            setListening(true);
            setTranscript("");
        };
        rec.onresult = (e) => {
            const text = e.results?.[0]?.[0]?.transcript?.trim() || "";
            setTranscript(text);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);

        recognitionRef.current = rec;
        setSupported(true);

        return () => {
            recognitionRef.current && recognitionRef.current.stop();
        };
    }, [lang]);

    const start = useCallback(() => {
        const rec = recognitionRef.current;
        if (!rec) return;
        try {
            // nếu đang nghe thì dừng
            if (listening) {
                rec.stop();
            } else {
                rec.start();
            }
        } catch {
            // tránh lỗi already started
        }
    }, [listening]);

    const stop = useCallback(() => {
        recognitionRef.current && recognitionRef.current.stop();
    }, []);

    return {
        supported,
        listening,
        transcript,
        start,
        stop,
    };
}
