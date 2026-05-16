import { useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// ✅ MOST STABLE FREE MODEL
const MODEL = "openchat/openchat-7b:free";;

// ✅ SMALL + SMART PROMPT
const SYSTEM_PROMPT = `
You are Gyani AI, an expert Indian Life Insurance Coach.

Rules:
- Reply in simple professional English
- Keep answers short and crisp
- Use bullet points only
- Focus on Indian insurance market
- Be practical and advisor-friendly

Answer Format:
• Customer View
• Advisor View
• Financial Insight
• Recommendation
`;

export default function App() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "👋 Welcome to Gyani AI\nAsk anything about Life Insurance or Financial Planning.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // ✅ API CALL (OPENROUTER)
  const askAI = async (question) => {
    const response = await fetch(
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
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    return (
      data?.choices?.[0]?.message?.content ||
      "No response received."
    );
  };

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQuestion = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userQuestion },
    ]);

    setInput("");
    setLoading(true);

    try {
      const reply = await askAI(userQuestion);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `❌ ${error.message}`,
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <h1>🧠 Gyani AI</h1>

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
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Ask insurance question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={sendMessage}>
          Send 🚀
        </button>
      </div>
    </div>
  );
}
