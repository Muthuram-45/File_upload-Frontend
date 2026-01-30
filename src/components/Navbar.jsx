import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.png";
import axios from "axios";
import InviteEmployee from "./InviteEmployee";
import { FaUsers } from "react-icons/fa";
import "./Navbar.css";
import { FaSearch } from "react-icons/fa";
 
const API_BASE = "http://localhost:5000";
 
/* =========================================================
   ✅ HOOK INSIDE SAME FILE
   - Detect timezone
   - Live current time
   - Fetch last login time
========================================================= */
function useUserTimeAndLogin({ user, isFullUser }) {
  const [currentTime, setCurrentTime] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
 
  const [userTimeZone, setUserTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
 
  const getTimeZoneAbbr = (tz) => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
      }).formatToParts(new Date());
 
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      let abbr = tzPart?.value || tz;
 
      // ✅ India fix
      if (abbr === "GMT+5:30") abbr = "IST";
 
      return abbr;
    } catch {
      return tz;
    }
  };
 
  const timeZoneAbbr = useMemo(() => getTimeZoneAbbr(userTimeZone), [userTimeZone]);
 
  // ✅ Detect timezone
  useEffect(() => {
    const detectTimeZone = async () => {
      try {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
 
        if (tz === "Asia/Calcutta") tz = "Asia/Kolkata";
 
        if (tz) {
          setUserTimeZone(tz);
          return;
        }
 
        // fallback only if browser fails
        const res = await axios.get("https://ipapi.co/json/");
        if (res.data?.timezone) setUserTimeZone(res.data.timezone);
      } catch (err) {
        console.error("Timezone detect failed", err);
        setUserTimeZone("UTC");
      }
    };
 
    detectTimeZone();
  }, []);
 
  // ✅ Live current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          timeZone: userTimeZone,
          dateStyle: "medium",
          timeStyle: "medium",
        })
      );
    }, 1000);
 
    return () => clearInterval(interval);
  }, [userTimeZone]);
 
  // ✅ Fetch last login time
  useEffect(() => {
    const fetchLastLogin = async () => {
      if (!isFullUser || !user?.email) return;
 
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/user/${user.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        if (res.data?.user?.lastLogin) {
          setLastLoginTime(
            new Date(res.data.user.lastLogin).toLocaleString("en-US", {
              timeZone: userTimeZone,
              dateStyle: "medium",
              timeStyle: "short",
            })
          );
        } else {
          setLastLoginTime("-");
        }
      } catch (err) {
        console.log(err);
        setLastLoginTime("-");
      }
    };
 
    fetchLastLogin();
  }, [user?.email, isFullUser, userTimeZone]);
 
  return { currentTime, lastLoginTime, timeZoneAbbr, userTimeZone };
}
 
function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });
 
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
        return;
      }
 
      navigate("/nlp-results", {
        state: {
          question: questionToAsk,
          result: data,
        },
      });
      setNlpQuestion("");
    } catch (err) {
      console.log(err);
      setNlpError("Failed to process NLP query");
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
 
  // ✅ Use the hook (same file)
  const { currentTime, lastLoginTime, timeZoneAbbr } = useUserTimeAndLogin({
    user,
    isFullUser,
  });
 
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
        <div className="app-heading" onClick={() => navigate("/d-oxwilh9dy1")}>
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
                    Current Time{" "}
                    <small style={{ opacity: 0.75 }}>({timeZoneAbbr})</small>
                    <br />
                    <span>{currentTime}</span>
                  </p>
 
                  <p className="last-login">
                    Last Login{" "}
                    <small style={{ opacity: 0.75 }}>({timeZoneAbbr})</small>
                    <br />
                    <span>{lastLoginTime || "-"}</span>
                  </p>
 
                  <hr />
 
                  <div className="dropdown-actions">
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
            <button className="modal-close" onClick={() => setShowInvite(false)}>
              ✕
            </button>
            <InviteEmployee onClose={() => setShowInvite(false)} />
          </div>
        </div>
      )}
 
      {/* POPUP */}
      {popup.show && <div className="popup error">{popup.message}</div>}
 
      {/* NLP MODAL */}
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