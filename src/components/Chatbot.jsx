import { useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { IoMdClose, IoMdExpand } from "react-icons/io";
import { RiRobot3Line } from "react-icons/ri";
import { GrCircleQuestion } from "react-icons/gr";
import "./Chatbot.css";

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
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
        <GrCircleQuestion size={28} />
      </button>

      {open && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chat-header">
            <div className="header-left">
              <div className="header-icon">
                <RiRobot3Line size={18} />
              </div>
              <span className="header-title">Cloud360 - AI Assistant</span>
            </div>
            <div className="header-controls">
              <div className="close-btn" onClick={toggleChat}>
                <IoMdClose size={20} />
              </div>
            </div>
          </div>

          <div className="chat-body">
            {/* Welcome Logic - if empty */}
            {messages.length === 0 && (
              <div className="bot-msg">
                Hi there 👋 <br /> Let's explore how we can assist you today!
                <div className="msg-time">Just now</div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "user-msg" : "bot-msg"}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="bot-msg">Typing...</div>}
            {/* Dummy suggestions as seen in image if user hasn't typed anything yet?
                User asked "without affecting any functionality", so I won't mock user messages unless asked.
                I will stick to keeping functionality same: Show messages.
            */}
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Write your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="send-btn" style={{ border: "none", borderRadius: "45px", background: "#1d4ed8", color: "white" }} onClick={sendMessage} disabled={loading}>
                <FaArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
