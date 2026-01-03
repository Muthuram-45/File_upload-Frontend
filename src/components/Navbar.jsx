import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import logo from "../assets/logo.png";
import axios from "axios";
import InviteEmployee from "./InviteEmployee";
import { FaUsers } from "react-icons/fa";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [currentTime, setCurrentTime] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");

  const menuRef = useRef(null);
  const navigate = useNavigate();

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
      } catch { }
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
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <div className="navbar-right">

          {/* 🚫 VIEW ONLY USER → SHOW NOTHING */}
          {isViewUser && null}

          {/* 🔑 INVITED LOGIN USER (ACCESS TYPE = LOGIN) */}
          {!isViewUser && isPendingLogin && (
            <div className="auth-buttons">
              <button
                className="nav-btn outline"
                onClick={() => navigate("/cl-zv9ng4q6b8")}
              >
                Login
              </button>

              <button
                className="nav-btn primary"
                onClick={() => navigate("/cr-h2k8j5d1f5")}
              >
                Register
              </button>
            </div>
          )}

          {/* ✅ FULL USER */}
          {isFullUser && (
            <div className="profile-area" ref={menuRef}>
              <div
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-ring">
                  <div className="profile-avatar">
                    {user.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
                <span className="profile-name">{user.firstName}</span>
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu modern show">
                  <div className="profile-header">
                    <div className="profile-avatar large">
                      {user.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3>{user.firstName}</h3>
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
                    {user.company_name && (
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
    </>
  );
}

export default Navbar;
