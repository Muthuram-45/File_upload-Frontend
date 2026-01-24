import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.png";
import axios from "axios";
import InviteEmployee from "./InviteEmployee";
import { FaUsers } from "react-icons/fa";
import "./Navbar.css";
import { FaSearch } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [currentTime, setCurrentTime] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // ===============================
  // 🔥 NLP / ASK AI LOGIC
  // ===============================
  const [nlpQuestion, setNlpQuestion] = useState("");
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpError, setNlpError] = useState("");

  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [availableTables, setAvailableTables] = useState([]);

  const askNLP = async (forceMode = null) => {
    const questionToAsk = forceMode ? pendingQuestion : nlpQuestion;

    if (!questionToAsk.trim()) {
      setNlpError("Please enter a question");
      return;
    }

    try {
      setNlpLoading(true);
      setNlpError("");

      const res = await fetch(`${API_BASE}/nlp/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          question: questionToAsk,
          ...(forceMode && { forceMode }),
        }),
      });

      const data = await res.json();

      if (data.needsUserChoice) {
        setPendingQuestion(questionToAsk);
        setAvailableTables(data.datasets || []);
        setShowModeModal(true);
        return; // ⛔ STOP HERE
      }

      // ✅ Only navigate if final result
      navigate("/nlp-results", {
        state: {
          question: questionToAsk,
          result: data,
        },
      });
      setNlpQuestion(""); // Clear after asking
    } catch (err) {
      setNlpError("Failed to process NLP query", console.log(err));
    } finally {
      setNlpLoading(false);
    }
  };

  // ===============================
  // USER TYPES
  // ===============================
  const isViewUser = user?.viewOnly;
  const isPendingLogin = user?.pendingLogin;
  const isFullUser = user && !user.viewOnly && !user.pendingLogin;

  // ===============================
  // POPUP
  // ===============================
  const showPopup = (message) => {
    setPopup({ show: true, message });
    setTimeout(() => setPopup({ show: false, message: "" }), 3000);
  };

  const capitalize = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1);


  // ===============================
  // OUTSIDE CLICK CLOSE
  // ===============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (storedUser && token && !user) {
    setUser(JSON.parse(storedUser));
  }
}, [user, setUser]);


  // ===============================
  // LIVE TIME
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // LAST LOGIN (ONLY FULL USERS)
  // ===============================
  useEffect(() => {
    const fetchLastLogin = async () => {
      if (!isFullUser || !user?.email) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/user/${user.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.user?.lastLogin) {
          setLastLoginTime(
            new Date(res.data.user.lastLogin).toLocaleString()
          );
        }
      } catch (err) {
        console.log(err)
      }
    };

    fetchLastLogin();
  }, [user, isFullUser]);

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    navigate("/l-gy5n8r4v2t");
  };

  // ===============================
  // SETTINGS CLICK BLOCK
  // ===============================
  const handleSettingsClick = () => {
    if (isPendingLogin) {
      showPopup("🔐 Please login to access profile & settings.");
      return;
    }
    navigate("/settings");
  };

  return (
    <>
      <nav className="navbar">
        <div
          className="app-heading"
          onClick={() => navigate("/d-oxwilh9dy1")}
        >
          <div className="brand-container">
            <img src={logo} alt="Cloud360 Logo" className="logo" />

          </div>
        </div>

        <div className="navbar-right">

          {user && localStorage.getItem("token") && (
            <div className="navbar-search-wrapper compact">
              <div className="navbar-search rectangular">
                <FaSearch className="search-icon inside" />

                <input
                  type="text"
                  placeholder="Ask anything about your data"
                  value={nlpQuestion}
                  onChange={(e) => setNlpQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !showModeModal) {
                      askNLP();
                    }
                  }}
                  disabled={nlpLoading}
                />

                {nlpLoading && <span className="search-loader"></span>}
              </div>
            </div>
          )}


          {/* 👤 PROFILE */}
          {isFullUser && (
            <div className="profile-area" ref={menuRef}>
              <div
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="profile-avatar">
                  {user.firstName?.[0]?.toUpperCase() || "A"}
                </div>
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu modern show">
                  <div className="profile-header">
                    <div className="profile-avatar large">
                      {user.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3>
                        {capitalize(user.firstName)} {capitalize(user.lastName)}
                      </h3>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <hr />

                  <p className="time-display">
                    Current Time <br />
                    <span>{currentTime}</span>
                  </p>

                  <p className="last-login">
                    Last Login <br />
                    <span>{lastLoginTime || "-"}</span>
                  </p>

                  <hr />

                  <div className="dropdown-actions">
                    {/* ✅ FIX: MANAGER ONLY */}
                    {user.role === "manager" && (
                      <button
                        className="settings-btn"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowInvite(true);
                        }}
                      >
                        <FaUsers /> Invite to Join
                      </button>
                    )}

                    <button
                      className="settings-btn"
                      onClick={handleSettingsClick}
                    >
                      <FiSettings /> Settings
                    </button>

                    <button className="logout-btn" onClick={handleLogout}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </nav>

      {/* INVITE MODAL */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowInvite(false)}
            >
              ✕
            </button>
            <InviteEmployee onClose={() => setShowInvite(false)} />
          </div>
        </div>
      )}

      {/* POPUP */}
      {popup.show && (
        <div className="popup error">{popup.message}</div>
      )}

      {/* 🔥 NLP MODAL (User Choice) */}
      {showModeModal && (
        <div className="nlp-modal-backdrop">
          <div className="nlp-modal">
            <h3>Multiple datasets found</h3>

            <p>
              Your question matches <b>{availableTables.length}</b> datasets.
              How do you want the result?
            </p>

            <ul>
              {availableTables.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowModeModal(false);
                  askNLP("combined");
                }}
              >
                Aggregate
              </button>

              <button
                onClick={() => {
                  setShowModeModal(false);
                  askNLP("separate");
                }}
              >
                Separate
              </button>
              <button
                className="cancel"
                onClick={() => {
                  setShowModeModal(false);
                  setPendingQuestion("");
                }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default Navbar;
