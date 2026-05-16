import { useState, useRef, useEffect } from "react";
import "./App.css";

// ✅ Gemini API Key from Vite ENV
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ✅ Free + Fast Model
const MODEL = "gemini-1.5-flash-8b";

// ✅ Small Token Optimized Prompt
const SYSTEM_PROMPT = `
You are Gyani AI, an expert Indian Life Insurance Coach.

Rules:
- Reply only in professional English
- Keep answers short, crisp, practical
- Use bullet points
- Give advanced insurance insights simply
- Focus on Indian market
- Explain from:
1. Customer View
2. Advisor View
3. Financial View
4. Final Recommendation

Topics:
Term Insurance, ULIP, Retirement, Child Plans,
Wealth Creation, Need Based Selling,
Objection Handling, Financial Planning.

Tone:
Professional, smart, practical, human.
`;

export default function App() {
  // ✅ Default Welcome Message
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "👋 Welcome to Gyani AI\nAsk anything about Life Insurance, Sales or Financial Planning.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ✅ Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ✅ Gemini API Function
  const callGemini = async (userText) => {
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
                role: "user",

                parts: [
                  {
                    text: `
${SYSTEM_PROMPT}

User Question:
${userText}
                    `,
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 20,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      // ✅ Error Handling
      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Something went wrong"
        );
      }

      // ✅ AI Text Response
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response received."
      );
    } catch (error) {
      return `❌ ${error.message}`;
    }
  };

  // ✅ Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input,
    };

    // ✅ Update Chat
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setLoading(true);

    // ✅ Get AI Reply
    const aiReply = await callGemini(currentInput);

    // ✅ Add AI Reply
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: aiReply,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>🧠 Gyani AI</h1>
        <p>Life Insurance Expert</p>
      </header>

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

        <div ref={messagesEndRef} />
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
