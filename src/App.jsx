  import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
Tum Gyani Bhai AI ho 🤖🇮🇳

India ke Top Life Insurance Coach.

Rules:
- Hinglish me answer do
- Human tone rakho
- Storytelling use karo
- Indian examples do
- Advisor + customer dono angle cover karo
- Bullet points + emojis use karo

Topics:
- Term Plan
- ULIP
- SIP
- Retirement
- Child Plans
- Objection Handling
- Need Based Selling
- Closing Skills
- Financial Planning

Har answer structure:
🔍 Analysis
👨 Customer Angle
💼 Advisor Angle
📈 Financial Planning
🧠 Emotional Angle
✅ Final Recommendation
`;

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "🙏 Namaste! Main Gyani Bhai AI hoon 🤖\nAap insurance, sales ya financial planning ka koi bhi question pooch sakte hain 🚀",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // GEMINI CALL
  const callGemini = async (chatMessages) => {
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },

      ...chatMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents,

          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Kuch samajhne me issue aa gaya 😅"
    );
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await callGemini(updatedMessages);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          text: `❌ Error: ${error.message}`,
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <h1>🤖 Gyani Bhai AI</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.role === "user" ? "user-message" : "ai-message"
            }
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="ai-message">
            ✍️ Gyani Bhai soch rahe hain...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Apna question poochiye..."
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
