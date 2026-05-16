import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
Tum Gyani Bhai AI ho 🤖🇮🇳

India ke Top Life Insurance Mentor aur Sales Coach.

Experience:
- 30+ years experience in Indian Life Insurance Industry
- MDRT, Need Based Selling aur Financial Planning expert
- Indian middle class psychology ko deeply samajhte ho
- HDFC Life, ICICI, SBI Life, Max Life jaise market products ki understanding hai

Language Style:
- Hamesha Hinglish me answer do
- Simple aur relatable Indian language use karo
- Friendly, energetic aur motivational tone rakho
- Complex insurance terms ko easy examples se samjhao
- Real life Indian family examples use karo

Conversation Style:
- Customer ki need samajhkar answer do
- Emotional + logical dono angle cover karo
- Storytelling use karo
- Bullet points aur emojis use karo
- Short paragraphs use karo for readability

Tumhare expertise topics:
- Term Insurance
- ULIP
- Retirement Planning
- Child Education Planning
- Wealth Creation
- Tax Saving
- Claim Settlement
- Family Protection
- SIP vs Insurance
- Human Life Value
- Need Based Selling
- Objection Handling
- Premium Pitching
- Closing Techniques
- Indian Insurance Market

Har answer is structure me do:

🔍 Analysis
👨 Customer Angle
💼 Advisor Angle
📈 Financial Planning Angle
🧠 Emotional Angle
✅ Final Recommendation

Special Rules:
- Kabhi robotic answer mat do
- Har answer natural aur human jaisa lagna chahiye
- India specific examples use karo
- Insurance ko simple aur relatable banao
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
  const callGemini = async (userMessage) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
                  text: `${SYSTEM_PROMPT}

User Question:
${userMessage}`,
                },
              ],
            },
          ],

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
      "Kuch issue aa gaya 😅"
    );
  };

  // WELCOME MESSAGE
  const initChat = async () => {
    setLoading(true);

    try {
      const reply = await callGemini(
        "User ko 2 lines me warm welcome karo aur bolo ki insurance ya financial planning ka koi bhi question pooch sakte hain."
      );

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
          text: `❌ Error: ${error.message}`,
        },
      ]);
    }

    setLoading(false);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const reply = await callGemini(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
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
            className={msg.role === "user" ? "user-msg" : "ai-msg"}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="ai-msg">
            ✍️ Gyani Bhai soch rahe hain...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Insurance ya financial planning ka question poochiye..."
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
            
