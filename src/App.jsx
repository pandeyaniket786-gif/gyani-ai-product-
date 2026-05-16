import { useState } from "react";
import "./App.css";

// ✅ OPENROUTER API KEY
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// ✅ FREE MODEL
const MODEL = "meta-llama/llama-3.1-8b-instruct:free";

// ✅ SMALL TOKEN PROMPT
const SYSTEM_PROMPT = `
You are Gyani AI, an expert Indian Life Insurance Coach.

Rules:
- Reply in professional English
- Keep answers short and practical
- Use bullet points
- Focus on Indian insurance market
- Explain simply

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

  // ✅ OPENROUTER API
  const askAI = async (question) => {
    try {
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

      // ✅ HANDLE ERRORS
      if (data.error) {
        throw new Error(
          data.error.message || "API Error"
        );
      }

      // ✅ AI RESPONSE
      return (
        data?.choices?.[0]?.message?.content ||
        "No response received."
      );
    } catch (error) {
      return `❌ ${error.message}`;
    }
  };

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQuestion = input;

    // USER MESSAGE
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    setInput("");
    setLoading(true);

    // AI RESPONSE
    const reply = await askAI(userQuestion);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: reply,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <h1>🧠 Gyani AI</h1>

      {/* CHAT AREA */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.role === "user"
                ? "user-message"
                : "ai-message"
            }
          >
            {msg.text}
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="ai-message">
            Thinking...
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="input-area">
        <input
          type="text"
          placeholder="Ask your insurance question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          Send 🚀
        </button>
      </div>
    </div>
  );
}
