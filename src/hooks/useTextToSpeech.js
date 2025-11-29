// src/hooks/useTextToSpeech.js
import { useCallback, useEffect, useState } from "react";

export function useTextToSpeech({ lang = "vi-VN" } = {}) {
    const [supported, setSupported] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if ("speechSynthesis" in window) {
            setSupported(true);
        }
    }, []);

    const stop = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        setSpeaking(false);
    }, [supported]);

    const speak = useCallback(
        (text) => {
            if (!supported || !text) return;
            window.speechSynthesis.cancel();

            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = lang;
            utter.rate = 1;
            utter.pitch = 1;

            utter.onstart = () => setSpeaking(true);
            utter.onend = () => setSpeaking(false);
            utter.onerror = () => setSpeaking(false);

            window.speechSynthesis.speak(utter);
        },
        [lang, supported]
    );

    return { supported, speaking, speak, stop };
}
