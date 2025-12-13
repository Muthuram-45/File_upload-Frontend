import { useState } from "react";
import { IoChatbubblesOutline } from "react-icons/io5";
import "./chatbot.css";
 
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
 
  const toggleChat = () => setOpen(!open);
 
  async function sendMessage() {
    if (!input.trim()) return;
 
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
 
    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });
 
      if (!res.ok) {
        throw new Error("Server error: " + res.status);
      }
 
      const data = await res.json();
 
      const botMsg = {
        role: "bot",
        text: data.answer || "No response",
      };
 
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server Error ❌" },
      ]);
    }
 
    setLoading(false);
  }
 
  return (
    <>
      <button className="chat-open-btn" onClick={toggleChat}>
        <IoChatbubblesOutline size={26} />
      </button>
 
      {open && (
        <div className="chatbot-container">
          <div className="chat-header">
            Chatbot
            <span className="close-btn" onClick={toggleChat}>
              ✖
            </span>
          </div>
 
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "user-msg" : "bot-msg"}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="bot-msg">Typing...</div>}
          </div>
 
          <div className="input-box">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
 