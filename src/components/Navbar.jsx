import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.png";
import axios from "axios";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [userCountry, setUserCountry] = useState("Your Country");

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-detect timezone and country from IP
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await axios.get("https://ipapi.co/json/");
        if (res.data) {
          setUserTimeZone(res.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
          setUserCountry(res.data.country_name || "Your Country");
        }
      } catch (err) {
        console.error("Failed to get location from IP, using system timezone", err);
      }
    };

    fetchUserLocation();
  }, []);

  // Live current time
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

  // Fetch last login
  useEffect(() => {
    const fetchLastLogin = async () => {
      if (!user?.email) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/user/${user.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.user?.lastLogin) {
          const lastLogin = new Date(res.data.user.lastLogin);
          setLastLoginTime(
            lastLogin.toLocaleString("en-US", {
              timeZone: userTimeZone,
              dateStyle: "medium",
              timeStyle: "short",
            })
          );
        }
      } catch (err) {
        console.error("Error fetching last login:", err);
      }
    };

    fetchLastLogin();
  }, [user, userTimeZone]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    navigate("/l-gy5n8r4v2t");
  };

  return (
    <nav className="navbar">
      <div className="app-heading" onClick={() => navigate("/d-oxwilh9dy1")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className="navbar-right">
        {user && (
          <div className="profile-area" ref={menuRef}>
            <div className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="avatar-ring">
                <div className="profile-avatar">{user?.firstName?.charAt(0).toUpperCase() || "U"}</div>
              </div>
              <span className="profile-name">{user?.firstName || "User"}</span>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu modern show" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                  <div className="profile-avatar large">{user?.firstName?.charAt(0).toUpperCase() || "U"}</div>
                  <div className="profile-text">
                    <h3>{user?.firstName || "User"}</h3>
                    <p>{user?.email}</p>
                  </div>
                </div>

                <hr />
                <p className="time-display">
                  Current Time (<span className="country">{userCountry}</span>) : <br />
                  <span className="time-text">{currentTime}</span>
                </p>
                <p className="last-login">
                  Last Login (<span className="country">{userCountry}</span>) : <br />
                  <span className="time-text">{lastLoginTime}</span>
                </p>

                <hr />

                <div className="dropdown-actions">
                  <button className="settings-btn" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                    <FiSettings className="icon" /> Settings
                  </button>

                  <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut className="icon" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
