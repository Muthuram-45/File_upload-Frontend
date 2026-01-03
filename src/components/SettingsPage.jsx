import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChangeName from "./ChangeName";
import ChangeMobile from "./ChangeMobile";
import ChangePassword from "./ChangePassword";
import Footer from "./Footer";
import {
  FaUserCircle,
  FaUserEdit,
  FaPhoneAlt,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";
import "./SettingsPage.css";

function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginType, setLoginType] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/l-gy5n8r4v2t");
  }, [navigate]);

  // Load user info
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    const googleUser = JSON.parse(localStorage.getItem("googleUserInfo"));
    const companyUser = JSON.parse(localStorage.getItem("company"));

    let activeUser = null;
    let type = "";

    if (companyUser) {
      activeUser = companyUser;
      type = "company";
    } else if (localUser) {
      activeUser = localUser;
      type = "user";
    } else if (googleUser) {
      activeUser = googleUser;
      type = "google";
    }

    if (!activeUser) {
      setLoading(false);
      return;
    }

    setUser(activeUser);
    setLoginType(type);

    // Fetch latest user data
    if (activeUser?.email) {
      fetch(`http://localhost:5000/user/${activeUser.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const updatedUser = { ...activeUser, ...data.user };
            setUser(updatedUser);
            if (type === "google") localStorage.setItem("googleUserInfo", JSON.stringify(updatedUser));
            else if (type === "user") localStorage.setItem("user", JSON.stringify(updatedUser));
            else if (type === "company") localStorage.setItem("company", JSON.stringify(updatedUser));
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [navigate]);

  // Close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".settings-sidebar") && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [sidebarOpen]);

  const renderProfile = () => {
    const companyName = user?.company_name || user?.companyName || user?.company || user?.organization || null;

    return (
      <div className="settings-content profile-section">
        <div className="profile-card">
          <FaUserCircle className="profile-icon" />
          <h2>{user?.firstName || user?.displayName || "User"} {user?.lastName || ""}</h2>
          <p className="profile-tagline">
            Welcome back — keeping your data secure and under your control.
          </p>
        </div>

        <div className="profile-details">
          <div className="detail-item"><strong>First Name:</strong> {user?.firstName || "—"}</div>
          <div className="detail-item"><strong>Last Name:</strong> {user?.lastName || "—"}</div>
          {companyName && <div className="detail-item"><strong>Company:</strong> {companyName}</div>}
          <div className="detail-item"><strong>Email:</strong> {user?.email || "—"}</div>
          <div className="detail-item"><strong>Mobile:</strong> {user?.mobile || "—"}</div>
          <div className="detail-item"><strong>Login Type:</strong> {loginType || "—"}</div>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    if (loading) return <div className="settings-content">Loading user data...</div>;

    switch (activeSection) {
      case "profile": return renderProfile();
      case "name": return <ChangeName />;
      case "mobile": return <ChangeMobile />;
      case "password": return <ChangePassword />;
      default: return <div className="settings-content">Select a section</div>;
    }
  };

  return (
    <>
    <div className="settings-page">
      {/* Hamburger Button */}
      <div className="hamburger" onClick={toggleSidebar}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <aside className={`settings-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
         
          <h3>Settings</h3>
        </div>

        <button className={activeSection === "profile" ? "active" : ""} onClick={() => setActiveSection("profile")}>
          <FaUserCircle className="icon" /> &nbsp; Profile Overview
        </button>
        <button className={activeSection === "name" ? "active" : ""} onClick={() => setActiveSection("name")}>
          <FaUserEdit className="icon" /> &nbsp; Change Name
        </button>
        <button className={activeSection === "mobile" ? "active" : ""} onClick={() => setActiveSection("mobile")}>
          <FaPhoneAlt className="icon" /> &nbsp; Change Mobile
        </button>
        <button className={activeSection === "password" ? "active" : ""} onClick={() => setActiveSection("password")}>
          <FaLock className="icon" /> &nbsp; Change Password
        </button>

        <hr />
        <button className="back-button" onClick={() => navigate("/d-oxwilh9dy1")}>
          <FaArrowLeft /> &nbsp; Back to Dashboard
        </button>
      </aside>

      <main className="settings-main">{renderSection()}</main>

  
    </div>
    <Footer/>
    </>
  );
}

export default SettingsPage;
