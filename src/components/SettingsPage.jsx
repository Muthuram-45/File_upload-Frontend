import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChangeName from "./ChangeName";
import ChangeMobile from "./ChangeMobile";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import {
  FaUserCircle,
  FaUserEdit,
  FaPhoneAlt,
  FaLock,
  FaKey,
  FaArrowLeft,
} from "react-icons/fa";
import "./SettingsPage.css";
import Footer from "./Footer";

function SettingsPage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginType, setLoginType] = useState("");

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/l-gy5n8r4v2t");
  }, [navigate]);

  // Load user info from localStorage + fetch latest data from backend
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
      console.warn("⚠️ No user found in localStorage");
      setLoading(false);
      return;
    }

    setUser(activeUser);
    setLoginType(type);

    // ✅ Fetch latest user details from backend
    if (activeUser?.email) {
      fetch(`http://localhost:5000/user/${activeUser.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            // Merge latest backend data with existing local user data
            const updatedUser = { ...activeUser, ...data.user };
            setUser(updatedUser);

            // ✅ Update correct localStorage entry
            if (type === "google") {
              localStorage.setItem(
                "googleUserInfo",
                JSON.stringify(updatedUser)
              );
            } else if (type === "user") {
              localStorage.setItem("user", JSON.stringify(updatedUser));
            } else if (type === "company") {
              localStorage.setItem("company", JSON.stringify(updatedUser));
            }
          } else {
            console.warn("⚠️ Invalid or missing user response:", data);
          }
        })
        .catch((err) => console.error("❌ Error fetching user data:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // ===== Render Profile Section =====
  const renderProfile = () => {
    const companyName =
      user?.company_name ||
      user?.companyName ||
      user?.company ||
      user?.organization ||
      null;

    return (
      <div className="settings-content profile-section">
        <div className="profile-card">
          <FaUserCircle className="profile-icon" />
          <h2>
            {user?.firstName || user?.displayName || "User"}{" "}
            {user?.lastName || ""}
          </h2>
          <p className="profile-tagline">
            Welcome back  — keeping your data secure and under your control.
          </p>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <strong>First Name:</strong> &nbsp; {user?.firstName || "—"}
          </div>
          <div className="detail-item">
            <strong>Last Name:</strong> &nbsp; {user?.lastName || "—"}
          </div>

          {/* ✅ Always show company name if available */}
          {companyName && (
            <div className="detail-item">
              <strong>Company:</strong> &nbsp; {companyName}
            </div>
          )}

          <div className="detail-item">
            <strong>Email:</strong> &nbsp; {user?.email || "—"}
          </div>
          <div className="detail-item">
            <strong>Mobile:</strong> &nbsp; {user?.mobile || "—"}
          </div>

          {/* Optional: Show login type for clarity */}
          <div className="detail-item">
            <strong>Login Type:</strong> &nbsp; {loginType || "—"}
          </div>
        </div>
      </div>
    );
  };

  // ===== Section Router =====
  const renderSection = () => {
    if (loading)
      return <div className="settings-content">Loading user data...</div>;

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

  // ===== Page Layout =====
  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <div className="sidebar-header">
          <FaUserCircle className="sidebar-icon" />
          <h3>Settings</h3>
        </div>

        <button
          className={activeSection === "profile" ? "active" : ""}
          onClick={() => setActiveSection("profile")}
        >
          <FaUserCircle className="icon" /> &nbsp;&nbsp; Profile Overview
        </button>

        <button
          className={activeSection === "name" ? "active" : ""}
          onClick={() => setActiveSection("name")}
        >
          <FaUserEdit className="icon" /> &nbsp;&nbsp; Change Name
        </button>

        <button
          className={activeSection === "mobile" ? "active" : ""}
          onClick={() => setActiveSection("mobile")}
        >
          <FaPhoneAlt className="icon" /> &nbsp;&nbsp; Change Mobile
        </button>

        <button
          className={activeSection === "password" ? "active" : ""}
          onClick={() => setActiveSection("password")}
        >
          <FaLock className="icon" /> &nbsp;&nbsp; Change Password
        </button>

       

        <hr />

        <button className="back-button" onClick={() => navigate("/d-oxwilh9dy1")}>
          <FaArrowLeft /> &nbsp;&nbsp; Back to Dashboard
        </button>
      </aside>

      <main className="settings-main">{renderSection()}</main>

      <Footer />
    </div>
  );
}

export default SettingsPage;
