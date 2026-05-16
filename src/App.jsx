import { useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ✅ ONLY WORKING MODEL
const MODEL = "gemini-2.0-flash";

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

  // ✅ GEMINI API
  const askAI = async (question) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
${SYSTEM_PROMPT}

Question:
${question}
                    `,
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      // ✅ HANDLE API ERRORS
      if (data.error) {
        throw new Error(data.error.message);
      }

      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response."
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

      {/* CHAT */}
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

        {loading && (
          <div className="ai-message">
            Thinking...
          </div>
        )}
      </div>

      {/* INPUT */}
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
