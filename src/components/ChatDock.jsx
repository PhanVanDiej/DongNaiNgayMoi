import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTextToSpeech } from "../hooks/useTextToSpeech";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

let msgId = 1;
const nextId = () => msgId++;

/**
 * props:
 *  - onAsk(text, ui)  // ui.push({role, content})
 */
function ChatDockInner({ onAsk }, ref) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: nextId(),
      role: "assistant",
      content:
        "Chào bạn, tôi là trợ lý bản đồ cho **tỉnh Đồng Nai mới**.\n\nBạn có thể hỏi về kinh tế, dân cư, du lịch, món ăn, hoặc thông tin chi tiết về từng xã/phường.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const [copiedId, setCopiedId] = useState(null);

  // Voice in
  const speech = useSpeechRecognition({ lang: "vi-VN" });
  const lastTranscriptRef = useRef("");

  // Voice out
  const tts = useTextToSpeech({ lang: "vi-VN" });
  const [muted, setMuted] = useState(false);

  const micAutoReadRef = useRef(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🔹 cho parent gọi được open + focus input
  useImperativeHandle(ref, () => ({
    openAndFocus() {
      setOpen(true);
      // chờ render xong rồi mới focus/select
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    },
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, open]);

  // Khi có transcript từ mic -> gửi luôn câu hỏi
  useEffect(() => {
    const t = speech.transcript;
    if (!t) return;
    if (t === lastTranscriptRef.current) return;
    lastTranscriptRef.current = t;

    const text = t.trim();
    if (!text) return;

    sendQuestion(text, { fromMic: true });
  }, [speech.transcript]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendClick = () => {
    if (!input.trim()) return;
    sendQuestion(input, { fromMic: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleCopy = async (text, id) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const handleRegenerate = (assistantIndex) => {
    const msgs = messages;
    const assistantMsg = msgs[assistantIndex];
    if (!assistantMsg || assistantMsg.role !== "assistant") return;

    const prevUser = [...msgs]
      .slice(0, assistantIndex)
      .reverse()
      .find((m) => m.role === "user");

    if (!prevUser) return;

    sendQuestion(prevUser.content, { fromMic: false });
  };

  async function sendQuestion(text, { fromMic = false } = {}) {
    const q = text.trim();
    if (!q) return;

    setInput("");
    micAutoReadRef.current = fromMic;

    const userMsg = { id: nextId(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const ui = {
      push: (msg) => {
        if (!msg) return;
        const id = msg.id ?? nextId();
        const role = msg.role || "assistant";
        const content = msg.content ?? "";

        setMessages((prev) => [...prev, { id, role, content }]);

        if (
          role === "assistant" &&
          micAutoReadRef.current &&
          !muted &&
          tts?.supported &&
          content
        ) {
          tts.stop?.();
          tts.speak(content);
          micAutoReadRef.current = false;
        }
      },
    };

    try {
      await onAsk?.(q, ui);
    } catch (e) {
      console.error("ChatDock onAsk error:", e);
      ui.push({
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Bạn vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
      micAutoReadRef.current = false;
    }
  }

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (next && tts?.speaking) {
        tts.stop();
      }
      return next;
    });
  };

  const handleMicClick = () => {
    if (!speech.supported) return;
    if (speech.listening && speech.stop) {
      speech.stop();
      return;
    }
    lastTranscriptRef.current = "";
    speech.start();
  };

  if (!open) {
    return (
      <button
        className="fixed right-12 bottom-3 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white text-sm shadow-lg hover:bg-sky-700"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
      >
        <i className="fa-solid fa-comments" />
        <span>Chat Đồng Nai</span>
      </button>
    );
  }

  return (
    <div className="fixed right-12 bottom-3 z-30 w-[360px] md:w-[420px] max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-700 to-sky-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <i className="fa-solid fa-robot text-sm" />
          </div>
          <div>
            <div className="text-xs opacity-80">Trợ lý AI</div>
            <div className="text-sm font-semibold">Chat Đồng Nai</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tts?.supported && (
            <button
              onClick={handleToggleMute}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-xs"
              title={muted ? "Bật đọc trả lời" : "Tắt tiếng / dừng đọc"}
            >
              <i
                className={`fa-solid ${muted ? "fa-volume-xmark" : "fa-volume-high"
                  } text-sm`}
              />
            </button>
          )}

          <button
            onClick={() => {
              setOpen(false);
              if (tts?.speaking) tts.stop();
            }}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs"
          >
            Ẩn chat
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-3 pt-3 pb-2 overflow-auto bg-sky-50/40">
        {messages.map((m, idx) => (
          <div
            key={m.id}
            className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"
              } group`}
          >
            <div className="flex flex-col max-w-[80%]">
              <div
                className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${m.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
                  }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p {...props} className="mb-1 last:mb-0" />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} className="font-semibold" />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className="list-disc pl-4 mb-1" />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className="mb-0.5" />
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>

              <div
                className={`mt-1 flex gap-3 text-[11px] text-gray-400 ${m.role === "user" ? "justify-end" : "justify-start"
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <button
                  onClick={() => handleCopy(m.content, m.id)}
                  className="inline-flex items-center gap-1 hover:text-gray-700"
                >
                  <i className="fa-regular fa-copy text-[10px]" />
                  <span>{copiedId === m.id ? "Đã copy" : "Copy"}</span>
                </button>

                {m.role === "assistant" && (
                  <button
                    onClick={() => handleRegenerate(idx)}
                    className="inline-flex items-center gap-1 hover:text-gray-700"
                  >
                    <i className="fa-solid fa-rotate-right text-[10px]" />
                    <span>Trả lời lại</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-2 flex justify-start">
            <div className="px-3 py-2 rounded-2xl bg-white text-[13px] text-gray-500 shadow-sm">
              Đang trả lời…
            </div>
          </div>
        )}
        {speech.listening && (
          <div className="mb-1 text-[11px] text-rose-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Đang nghe, bạn hãy nói…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-3 py-2">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về kinh tế, du lịch, món ăn, xã/phường..."
            className="flex-1 resize-none max-h-24 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />

          {speech.supported && (
            <button
              onClick={handleMicClick}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm border ${speech.listening
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              title="Hỏi bằng giọng nói"
            >
              <i className="fa-solid fa-microphone" />
            </button>
          )}

          <button
            onClick={handleSendClick}
            className="px-4 h-9 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-60"
            disabled={!input.trim() || loading}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

// export mặc định dưới dạng forwardRef
export default forwardRef(ChatDockInner);
