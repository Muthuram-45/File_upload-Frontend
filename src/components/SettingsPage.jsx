import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChangeName from "./ChangeName";
import ChangeMobile from "./ChangeMobile";
import ChangePassword from "./ChangePassword";
import { IoMdArrowRoundBack } from "react-icons/io";
import Footer from "./Footer";
import {
  FaUserCircle,
  FaUserEdit,
  FaPhoneAlt,
  FaLock,
  FaArrowLeft,
  FaEnvelope,
  FaBuilding,
  FaShieldAlt,
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
 
    if (activeUser?.email) {
      fetch(`http://localhost:5000/user/${activeUser.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const updatedUser = { ...activeUser, ...data.user };
            setUser(updatedUser);
 
            if (type === "google")
              localStorage.setItem("googleUserInfo", JSON.stringify(updatedUser));
            else if (type === "user")
              localStorage.setItem("user", JSON.stringify(updatedUser));
            else if (type === "company")
              localStorage.setItem("company", JSON.stringify(updatedUser));
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [navigate]);
 
  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
 
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [sidebarOpen]);
 
  const renderProfile = () => {
    const companyName =
      user?.company_name ||
      user?.companyName ||
      user?.company ||
      user?.organization ||
      null;
 
    const getInitials = () => {
      const firstName = user?.firstName || user?.displayName || "U";
      const lastName = user?.lastName || "";
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };
 
    return (
      <div className="settings-content profile-section">
        <div className="profile-header-card">
          <div className="profile-banner"></div>
 
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span className="avatar-initials">{getInitials()}</span>
            </div>
 
            <div className="profile-header-info">
              <h2 className="profile-name">
                {user?.firstName || user?.displayName || "User"}{" "}
                {user?.lastName || ""}
              </h2>
              <p className="profile-email">
                <FaEnvelope className="inline-icon" />
                {user?.email || "—"}
              </p>
            </div>
          </div>
        </div>
 
        <div className="profile-info-grid">
          <div className="info-card">
            <div className="info-card-header">
              <FaUserCircle className="info-icon" />
              <h3>Personal Information</h3>
            </div>
 
            <div className="info-card-body">
              <div className="info-row">
                <span className="info-label">First Name</span>
                <span className="info-value">{user?.firstName || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Name</span>
                <span className="info-value">{user?.lastName || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Mobile Number</span>
                <span className="info-value">{user?.mobile || "—"}</span>
              </div>
            </div>
          </div>
 
          {companyName && (
            <div className="info-card">
              <div className="info-card-header">
                <FaBuilding className="info-icon" />
                <h3>Organization</h3>
              </div>
 
              <div className="info-card-body">
                <div className="info-row">
                  <span className="info-label">Company Name</span>
                  <span className="info-value">{companyName}</span>
                </div>
              </div>
            </div>
          )}
 
          <div className="info-card">
            <div className="info-card-header">
              <FaShieldAlt className="info-icon" />
              <h3>Account Security</h3>
            </div>
 
            <div className="info-card-body">
              <div className="info-row">
                <span className="info-label">Login Type</span>
                <span className="info-value login-type-badge">
                  {loginType || "—"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Account Status</span>
                <span className="info-value status-active">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  const renderSection = () => {
    if (loading) {
      return (
        <div className="settings-content loading-container">
          <div className="loader"></div>
          <p>Loading user data...</p>
        </div>
      );
    }
 
    switch (activeSection) {
      case "profile":
        return renderProfile();
      case "name":
        return <ChangeName />;
      case "mobile":
        return <ChangeMobile />;
      case "password":
        return <ChangePassword />;
      default:
        return <div className="settings-content">Select a section</div>;
    }
  };
 
  return (
    <>
      <div className="settings-page">
        {/* HAMBURGER */}
        <div
          className="hamburger"
          onClick={(e) => {
            e.stopPropagation(); // 🔥 FIX
            toggleSidebar();
          }}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
 
        {/* SIDEBAR */}
        <aside
          className={`settings-sidebar ${sidebarOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()} // 🔥 FIX
        >
          <div className="sidebar-header">
            <IoMdArrowRoundBack
              className="back-icon"
              onClick={() => navigate("/d-oxwilh9dy1")}
            />
            <h3>Account Settings</h3>
          </div>
 
          <nav className="sidebar-nav">
            <button
              className={`nav-button ${
                activeSection === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveSection("profile")}
            >
              <FaUserCircle className="icon" />
              <span>Profile Overview</span>
            </button>
 
            <button
              className={`nav-button ${
                activeSection === "name" ? "active" : ""
              }`}
              onClick={() => setActiveSection("name")}
            >
              <FaUserEdit className="icon" />
              <span>Change Name</span>
            </button>
 
            <button
              className={`nav-button ${
                activeSection === "mobile" ? "active" : ""
              }`}
              onClick={() => setActiveSection("mobile")}
            >
              <FaPhoneAlt className="icon" />
              <span>Change Mobile</span>
            </button>
 
            <button
              className={`nav-button ${
                activeSection === "password" ? "active" : ""
              }`}
              onClick={() => setActiveSection("password")}
            >
              <FaLock className="icon" />
              <span>Change Password</span>
            </button>
          </nav>
 
          <button
            className="back-button"
            onClick={() => navigate("/d-oxwilh9dy1")}
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
        </aside>
 
        <main className="settings-main">{renderSection()}</main>
      </div>
 
      <Footer />
    </>
  );
}
 
export default SettingsPage;
 
 