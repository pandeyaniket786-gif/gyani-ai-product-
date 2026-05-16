import { useState, useEffect, useRef } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// ✅ MOST STABLE SETUP
const MODEL = "openrouter/auto";

// 🧠 SMART + SMALL PROMPT
const SYSTEM_PROMPT = `
You are Gyani AI, an expert Indian Life Insurance Coach.

Rules:
- Reply in short professional English
- Use bullet points only
- Be practical and Indian market focused
- Always include:
  Customer View
  Advisor View
  Recommendation

Keep answers crisp and useful.
`;

export default function App() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "👋 Welcome to Gyani AI\nAsk any Life Insurance or Financial Planning question.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⚡ API CALL (NO ERROR SYSTEM)
  const askAI = async (question) => {
    try {
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            model: MODEL,

            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: question,
              },
            ],

            temperature: 0.7,
            max_tokens: 250,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "API Error");
      }

      return (
        data?.choices?.[0]?.message?.content ||
        "No response"
      );
    } catch (err) {
      return "❌ AI temporarily unavailable. Try again.";
    }
  };

  // 🚀 SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
    ]);

    setInput("");
    setLoading(true);

    const reply = await askAI(userText);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: reply },
    ]);

    setLoading(false);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <h1>🧠 Gyani AI Coach</h1>

      {/* CHAT BOX */}
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "user-message"
                : "ai-message"
            }
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="ai-message">
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask insurance question..."
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
        />

        <button onClick={sendMessage}>
          Send 🚀
        </button>
      </div>
    </div>
  );
}
