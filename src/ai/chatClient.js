// src/ai/chatClient.js
const API_BASE = "/api";

export async function askAI(messages) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error(`Chat API ${res.status}`);
    const data = await res.json();
    return data.reply;
}

export async function moderateText(text) {
    const res = await fetch(`${API_BASE}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    if (!res.ok) return { allowed: true };
    return res.json();
}
