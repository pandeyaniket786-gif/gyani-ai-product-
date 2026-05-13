import { useState, useRef, useEffect } from "react";
import "./App.css";
const API_KEY = "AIzaSyCgP3s7xz6JyAw_9OY9bXptrlnJlqvpsUc";
const SYSTEM_PROMPT = `Tu ek experienced Life Insurance Coach hai India ka, 30 saal ka experience. Naam hai Gyani Bhai. Hamesha Hinglish mein baat kar, friendly tone, Indian examples use kar. Simple bhasha, practical advice. Insurance products clearly explain kar: Term, ULIP, Endowment, Health.`;
function App() {
      const [messages, setMessages] = useState([]);
        const [input, setInput] = useState("");
          const [loading, setLoading] = useState(false);
            const [started, setStarted] = useState(false);
              const messagesEndRef = useRef(null);
                useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
                  useEffect(() => { if (!started) { setStarted(true); startConversation(); } }, []);
                    const startConversation = async () => {
                            setLoading(true);
                                try {
                                          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + " Abhivadan karo." }] }] }) });
                                                const data = await res.json();
                                                      setMessages([{ role: "assistant", text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Namaste!" }]);
                                } catch { setMessages([{ role: "assistant", text: "Namaste! Main Gyani Bhai hoon! 😊" }]); }
                                    setLoading(false);
                    };
                      const sendMessage = async () => {
                            if (!input.trim() || loading) return;
                                const userMsg = input.trim(); setInput("");
                                    const newMessages = [...messages, { role: "user", text: userMsg }];
                                        setMessages(newMessages); setLoading(true);
                                            try {
                                                      const history = newMessages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] }));
                                                            history.unshift({ role: "user", parts: [{ text: SYSTEM_PROMPT }] });
                                                                  history.splice(1, 0, { role: "model", parts: [{ text: "Samajh gaya!" }] });
                                                                        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: history }) });
                                                                              const data = await res.json();
                                                                                    setMessages([...newMessages, { role: "assistant", text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Ek minute..." }]);
                                            } catch { setMessages([...newMessages, { role: "assistant", text: "Network issue! 🙏" }]); }
                                                setLoading(false);
                      };
                        const suggestions = ["Term Insurance kya hota hai?","LIC vs Private?","Kitna cover chahiye?","ULIP sahi hai?","Claim kaise milta hai?","Tax benefit?"];
                          return (
                                <div className="app">
                                      <header className="header"><div className="header-inner"><div className="avatar">🧓</div><div className="header-info"><h1>Gyani Bhai</h1><span className="status">● Online • Insurance Expert</span></div><div className="exp-badge">30 Saal Ka Anubhav</div></div></header>
                                            <div className="chat-area">
                                                    {messages.length === 0 && loading && <div className="loading-start"><div className="dot-pulse"></div><p>Gyani Bhai aa rahe hain...</p></div>}
                                                            {messages.map((msg, i) => (<div key={i} className={`message ${msg.role}`}><div className="msg-avatar">🧓</div><div className="bubble">{msg.text.split("\n").map((line, j) => <p key={j}>{line}</p>)}</div></div>))}
                                                                    {loading && messages.length > 0 && <div className="message assistant"><div className="msg-avatar">🧓</div><div className="bubble typing"><span></span><span></span><span></span></div></div>}
                                                                            {messages.length === 1 && !loading && <div className="suggestions"><p className="sug-label">Popular Sawaal 👇</p><div className="sug-grid">{suggestions.map((s, i) => <button key={i} className="sug-btn" onClick={() => setInput(s)}>{s}</button>)}</div></div>}
                                                                                    <div ref={messagesEndRef} />
                                                                                          </div>
                                                                                                <div className="input-area"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Koi bhi insurance sawaal poochho... 🙏" rows={1} disabled={loading} /><button onClick={sendMessage} disabled={loading||!input.trim()} className="send-btn">{loading?"⏳":"➤"}</button></div>
                                                                                                    </div>
                          );
}
export default App;
