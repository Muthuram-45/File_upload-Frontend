import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { FiSettings, FiLogOut } from "react-icons/fi"; // 👈 Added icons
import logo from "../assets/logo.png";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const companyUser = user?.isCompany;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("googleUserInfo");
      localStorage.removeItem("company");
      sessionStorage.clear();

      setUser(null);
      if (user?.isGoogleUser) await auth.signOut();

      navigate(companyUser ? "/cf-2g7h9k3l5m" : "/l-gy5n8r4v2t");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="navbar">
      {/* ===== Left Logo Section ===== */}
      <div
        className="app-heading"
        onClick={() => navigate("/d-oxwilh9dy1")}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {/* ===== Right Section ===== */}
      <div className="navbar-right">
        {user ? (
          <div className="profile-area" ref={menuRef}>
            <div
              className="profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar-ring">
                <div className="profile-avatar">
                  {user?.firstName?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <span className="profile-name">{user?.firstName || "User"}</span>
            </div>

            {/* === Dropdown === */}
            {dropdownOpen && (
              <div
                className="dropdown-menu modern show"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-header">
                  <div className="profile-avatar large">
                    {user?.firstName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="profile-text">
                    <h3>{user?.firstName || "User"}</h3>
                    <p>{user?.email}</p>
                  </div>
                </div>

                <div className="dropdown-actions">
                  <button
                    className="settings-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <FiSettings className="icon" /> Settings
                  </button>

                  <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut className="icon" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons"></div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
