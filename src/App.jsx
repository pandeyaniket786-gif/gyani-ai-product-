import { useState, useRef, useEffect } from "react";
import "./App.css";

// ✅ VITE ENV VARIABLE
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ✅ WORKING MODEL
const MODEL = "gemini-2.0-flash";

// ✅ AI COACH SYSTEM PROMPT
const SYSTEM_PROMPT = `
Tum Gyani Bhai AI ho 🤖🇮🇳

India ke Top Life Insurance Mentor aur Sales Coach.

Tumhara kaam:
- Life insurance ko simple language me samjhana
- Advisors ko sales aur closing me help karna
- Financial planning guidance dena
- Emotional storytelling use karna

Rules:
- Hamesha Hinglish me answer do
- Friendly aur human tone rakho
- Indian examples use karo
- Bullet points aur emojis use karo
- Robotic answer kabhi mat do

Topics:
- Term Insurance
- ULIP
- SIP vs Insurance
- Child Plans
- Retirement Planning
- Need Based Selling
- Objection Handling
- MDRT Mindset
- Financial Planning
- Wealth Creation

Har answer structure:
🔍 Analysis
👨 Customer Angle
💼 Advisor Angle
📈 Financial Planning Angle
🧠 Emotional Angle
✅ Final Recommendation
`;

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "🙏 Namaste! Main Gyani Bhai AI hoon 🤖\n\nAap life insurance, sales, objection handling ya financial planning ka koi bhi question pooch sakte hain 🚀",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ✅ AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ✅ GEMINI API CALL
  const callGemini = async (chatMessages) => {
    try {
      // ✅ CONVERT CHAT HISTORY
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: SYSTEM_PROMPT,
            },
          ],
        },

        ...chatMessages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",

          parts: [
            {
              text: msg.text,
            },
          ],
        })),
      ];

      // ✅ API REQUEST
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
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

            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE",
              },
            ],
          }),
        }
      );

      // ✅ RESPONSE JSON
      const data = await response.json();

      console.log("Gemini Response:", data);

      // ✅ ERROR HANDLING
      if (!response.ok) {
        throw new Error(
          data?.error?.message || "API request failed"
        );
      }

      // ✅ EXTRACT TEXT
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      return text || "⚠️ Koi response nahi mila.";
    } catch (error) {
      console.error(error);

      return `❌ Error: ${error.message}`;
    }
  };

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input,
    };

    const updatedMessages = [...messages, userMessage];

    // ✅ SHOW USER MESSAGE
    setMessages(updatedMessages);

    // ✅ CLEAR INPUT
    setInput("");

    // ✅ LOADING
    setLoading(true);

    // ✅ GET AI RESPONSE
    const aiReply = await callGemini(updatedMessages);

    // ✅ SHOW AI RESPONSE
    setMessages([
      ...updatedMessages,
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
        <h1>🤖 Gyani Bhai AI</h1>
        <p>Indian Life Insurance Expert</p>
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
            ✍️ Gyani Bhai soch rahe hain...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="input-area">
        <input
          type="text"
          placeholder="Apna insurance question poochiye..."
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
