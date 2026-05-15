import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
Tum Gyani Bhai AI ho 🤖🇮🇳

30+ saal experienced Indian Life Insurance Coach.

Rules:
- Hamesha Hinglish me answer do
- Friendly Indian tone
- Real examples use karo
- Bullet points use karo
- Emojis use karo
- Insurance ko simple language me samjhao

Har answer 4 perspectives me do:
1. 👨 Customer Angle
2. 💼 Advisor Angle
3. 📈 Financial Planning Angle
4. 🧠 Emotional Angle

Knowledge:
- Term Insurance
- ULIP
- Endowment
- Retirement Planning
- Child Plans
- Tax Saving
- Claim Settlement
- Need Based Selling
- IRDAI 2026 updates
- Indian Insurance Market

Answer structure:
🔍 Analysis
👨 Customer View
💼 Advisor View
📈 Financial View
🧠 Emotional View
✅ Final Recommendation
`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // AUTO SCROLL

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // INITIAL CHAT

  useEffect(() => {
    initChat();
  }, []);

  // GEMINI API CALL

  const callGemini = async (contents) => {
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

    if (data.error) {
      throw new Error(data.error.message);
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Kuch issue aa gaya 😅"
    );
  };

  // INITIAL MESSAGE

  const initChat = async () => {
    setLoading(true);

    try {
      const reply = await callGemini([
        {
          role: "user",
          parts: [
            {
              text:
                SYSTEM_PROMPT +
                "\n\nUser ko 2 lines me welcome karo.",
            },
          ],
        },
      ]);

      setMessages([
        {
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (error) {
      setMessages([
        {
          role: "assistant",
          text: "Namaste 🙏 Main Gyani Bhai hoon. Insurance ke baare me kuch bhi poochho 😊",
        },
      ]);
    }

    setLoading(false);
  };

  // SEND MESSAGE

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setInput("");

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        text: userMessage,
      },
    ];

    setMessages(updatedMessages);

    setLoading(true);

    try {
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: SYSTEM_PROMPT,
            },
          ],
        },

        {
          role: "model",
          parts: [
            {
              text: "Samajh gaya 👍",
            },
          ],
        },

        ...updatedMessages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",

          parts: [
            {
              text: msg.text,
            },
          ],
        })),
      ];

      const reply = await callGemini(contents);

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

  // QUICK SUGGESTIONS

  const suggestions = [
    "💰 Term Insurance kya hai?",
    "📈 ULIP vs Mutual Fund",
    "🏦 FD vs Pension Plan",
    "👨‍👩‍👧 Family Protection Planning",
    "💸 Tax Saving ka best option",
    "📋 Claim settlement kaise hota hai?",
  ];

  return (
    <div className="app">
      {/* HEADER */}

      <header className="header">
        <div className="header-inner">
          <div className="avatar">🧓</div>

          <div className="header-info">
            <h1>
              Gyani Bhai <span className="verified">✓</span>
            </h1>

            <p className="tagline">
              India Ka AI Life Insurance Coach
            </p>

            <span className="status">
              <span className="dot"></span>
              Online
            </span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}

      <div className="chat-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
          >
            {msg.role === "assistant" && (
              <div className="msg-av">🧓</div>
            )}

            <div className="bubble">
              {msg.text.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {msg.role === "user" && (
              <div className="msg-av user-av">👤</div>
            )}
          </div>
        ))}

        {/* LOADING */}

        {loading && (
          <div className="message assistant">
            <div className="msg-av">🧓</div>

            <div className="bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* SUGGESTIONS */}

        {messages.length <= 1 && !loading && (
          <div className="suggestions">
            <p className="sug-label">⚡ Quick Questions</p>

            <div className="sug-grid">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  className="sug-btn"
                  onClick={() =>
                    setInput(item.substring(2))
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Insurance ke baare me poochho... 🙏"
          rows={1}
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          {loading ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}
                      }
            
