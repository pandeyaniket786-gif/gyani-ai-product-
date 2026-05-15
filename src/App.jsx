import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MAX_HISTORY = 10;

const SYSTEM_PROMPT = `
Tum "Gyani Bhai" ho — India ke sabse experienced Life Insurance Coach.

PROFILE:
- 30+ years experience
- Expert in Indian life insurance market till 2026
- HDFC Life, LIC, ICICI Prudential, SBI Life, Max Life knowledge
- MDRT level sales psychology
- Need based selling expert
- Storytelling master
- Human psychology samajhte ho
- Emotional selling aur financial planning dono jaante ho

LANGUAGE STYLE:
- Hamesha natural Hinglish mein jawab do
- Friendly, warm aur motivating tone
- Indian examples use karo
- Emojis use karo naturally
- Bullet points use karo

ANSWER FORMAT:
Har answer 4 angles se do:
1. Customer Perspective
2. Financial Perspective
3. Family/Emotional Perspective
4. Advisor/Sales Perspective

Jab bhi answer do:
- Real examples do
- Step-by-step explain karo
- Pros-cons batao
- Tax benefit explain karo
- Claim reality batao
- Practical advice do

SALES TRAINING MODE:
- objection handling sikhao
- closing lines do
- storytelling sikhao
- client psychology sikhao
- cross selling sikhao

IMPORTANT:
Kabhi boring corporate language mat use karo.
Always human sounding answers do.
`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [learnedData, setLearnedData] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    initChat();
  }, []);

  const callGemini = async (contents) => {
    const res = await fetch(
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
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
  };

  const initChat = async () => {
    setLoading(true);

    try {
      const reply = await callGemini([
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}

Warm welcome do in 2 lines.`,
            },
          ],
        },
      ]);

      setMessages([{ role: "assistant", text: reply }]);
    } catch (err) {
      setMessages([
        {
          role: "assistant",
          text: "Namaste 🙏 Main Gyani Bhai hoon! Insurance, retirement aur wealth planning ke sawaal poochho 😊",
        },
      ]);
    }

    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    const updated = [...messages, { role: "user", text: userText }];
    setMessages(updated);
    setLoading(true);

    try {
      // LEARNING MODE
      if (userText.startsWith("LEARN:")) {
        const learned = userText.replace("LEARN:", "").trim();

        setLearnedData((prev) => [...prev, learned]);

        setMessages([
          ...updated,
          {
            role: "assistant",
            text: `✅ Gyani Bhai ne seekh liya:

${learned}`,
          },
        ]);

        setLoading(false);
        return;
      }

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}

Learned Knowledge:
${learnedData.join("
")}`,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Samajh gaya, main Gyani Bhai hoon!" }],
        },
        ...updated.slice(-MAX_HISTORY).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
      ];

      const reply = await callGemini(contents);

      setMessages([
        ...updated,
        {
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (err) {
      setMessages([
        ...updated,
        {
          role: "assistant",
          text: `❌ Gyani Bhai thoda busy hain 😅

${err.message}`,
        },
      ]);
    }

    setLoading(false);
  };

  const suggestions = [
    "💰 Mere liye best insurance kaunsa hai?",
    "📈 ULIP vs Mutual Fund explain karo",
    "👨‍👩‍👧 Family protection planning kaise karein?",
    "🏦 FD vs Pension Plan",
    "💸 Tax saving + wealth creation ka best combo",
    "🎯 Client objection kaise handle karein?",
    "📋 Claim settlement reality kya hai?",
    "🧠 MDRT advisor kaise bane?",
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="avatar">🧓</div>

          <div className="header-info">
            <h1>
              Gyani Bhai <span className="verified">✓</span>
            </h1>

            <p className="tagline">
              India Ka Smart AI Life Insurance Coach
            </p>

            <span className="status">
              <span className="dot"></span>
              Online • AI Powered
            </span>
          </div>

          <div className="stats">
            <div className="stat">
              <span className="num">30+</span>
              <span className="lbl">Years</span>
            </div>

            <div className="divider"></div>

            <div className="stat">
              <span className="num">10K+</span>
              <span className="lbl">Clients</span>
            </div>
          </div>
        </div>
      </header>

      <div className="chat-area">
        {messages.length === 0 && loading && (
          <div className="loading-start">
            <div className="spinner"></div>
            <p>Gyani Bhai aa rahe hain... 🙏</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="msg-av">🧓</div>
            )}

            <div className="bubble">
              {msg.text.split("
").map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>

            {msg.role === "user" && (
              <div className="msg-av user-av">👤</div>
            )}
          </div>
        ))}

        {loading && messages.length > 0 && (
          <div className="message assistant">
            <div className="msg-av">🧓</div>

            <div className="bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className="suggestions">
            <p className="sug-label">⚡ Jaldi Poochho</p>

            <div className="sug-grid">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="sug-btn"
                  onClick={() => setInput(s.substring(2))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Insurance, retirement, investment ya sales ke baare mein poochho... 🙏"
          rows={1}
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          {loading ? <span className="btn-spin"></span> : "➤"}
        </button>
      </div>
    </div>
  );
}
