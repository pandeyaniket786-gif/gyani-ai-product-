import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SYSTEM_PROMPT = `Aap ek experienced Life Insurance Coach hain India ke, naam hai Gyani Bhai, 30 saal ka experience. Hamesha Hinglish mein jawab do. Friendly tone, real Indian examples use karo jaise Mumbai IT professional, Delhi business owner, Gujarat trader. Practical advice do, emojis use karo, bullet points use karo. Insurance products clearly explain karo: Term, ULIP, Endowment, Health.`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    initChat();
  }, []);

  const callGemini = async (contents) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  };

  const initChat = async () => {
    setLoading(true);
    try {
      const reply = await callGemini([
        { role: "user", parts: [{ text: SYSTEM_PROMPT + " Namaste karo 2 lines mein." }] },
      ]);
      setMessages([{ role: "assistant", text: reply }]);
    } catch (err) {
      setMessages([
        { role: "assistant", text: "Namaste! 🙏 Main Gyani Bhai hoon! Koi bhi insurance sawaal poochho 😊" },
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
      const contents = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Samajh gaya, main Gyani Bhai hoon!" }] },
        ...updated.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
      ];

      const reply = await callGemini(contents);
      setMessages([...updated, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages([...updated, { role: "assistant", text: `❌ Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const suggestions = [
    "💰 Term Insurance kya hai?",
    "🏦 LIC vs Private?",
    "📊 Kitna cover chahiye?",
    "📈 ULIP sahi hai?",
    "📋 Claim kaise milta hai?",
    "💸 Tax benefit?",
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
            <p className="tagline">India Ka #1 Life Insurance Coach</p>
            <span className="status">
              <span className="dot"></span> Online • Ready to Help
            </span>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="num">30+</span>
              <span className="lbl">Saal</span>
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
            {msg.role === "assistant" && <div className="msg-av">🧓</div>}
            <div className="bubble">
              {msg.text.split("\n").map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
            {msg.role === "user" && <div className="msg-av user-av">👤</div>}
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
          placeholder="Insurance ke baare mein poochho... 🙏"
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
