import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import "./Dashboard.css";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import InviteEmployee from "./InviteEmployee";
import { FaUsers } from "react-icons/fa";

import { IoHome } from "react-icons/io5";
import { SiFiles } from "react-icons/si";
import { CgProfile } from "react-icons/cg";
import { FcInvite } from "react-icons/fc";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =============================
  // AUTH HANDLING
  // =============================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      const companyUser = JSON.parse(localStorage.getItem("company"));
      const token = localStorage.getItem("token");

      if (companyUser && token) {
        setUser({ ...companyUser, isCompany: true });
        return;
      }

      if (firebaseUser) {
        try {
          const res = await fetch(
            `http://localhost:5000/user/${firebaseUser.email}`
          );
          const data = await res.json();
          if (data.success && data.user) {
            setUser({ ...data.user, isGoogleUser: true });
          }
        } catch {}
        return;
      }

      if (localUser && token) {
        setUser(localUser);
        return;
      }

      navigate("/login", { replace: true });
    });

    return () => unsubscribe();
  }, [navigate]);

  // =============================
  // FETCH DASHBOARD COUNTS
  // =============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/dashboard-counts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  if (!user || !stats) {
    return (
      <div className="dashboard-loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="professional-dashboard">

        {/* ☰ MOBILE MENU BUTTON */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>

        {/* =============================
            SIDEBAR (OVERLAY)
        ============================== */}
        <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">

            <div className="nav-section">
              <button
                className="nav-item"
                onClick={() => {
                  navigate("/d-oxwilh9dy1");
                  setIsSidebarOpen(false);
                }}
              >
                <span className="nav-icon" id="ho"><IoHome /></span>
                <span className="nav-label">Home</span>
              </button>

              <button
                className="nav-item"
                onClick={() => {
                  navigate("/cf-2g7h9k3l5m");
                  setIsSidebarOpen(false);
                }}
              >
                <span className="nav-icon" id="fi"><SiFiles /></span>
                <span className="nav-label">All Files</span>
              </button>
            </div>

            {/* MY WORKS */}
            <div className="nav-section">
              <div className="nav-section-title">My Works</div>

              <button className="nav-item">
                <span className="nav-label">
                  My Uploaded Files <b>{stats.me.uploadedFiles}</b>
                </span>
              </button>

              <button className="nav-item">
                <span className="nav-label">
                  My API Files <b>{stats.me.uploadedApi}</b>
                </span>
              </button>

              <button className="nav-item">
                <span className="nav-label">
                  My Processed Files <b>{stats.me.processedFiles}</b>
                </span>
              </button>
            </div>

            {/* COMPANY WORKS */}
            {stats.company && (
              <div className="nav-section">
                <div className="nav-section-title">Company Works</div>

                <button className="nav-item">
                  <span className="nav-label">
                    Uploaded Files <b>{stats.company.uploadedFiles}</b>
                  </span>
                </button>

                <button className="nav-item">
                  <span className="nav-label">
                    API Files <b>{stats.company.uploadedApi}</b>
                  </span>
                </button>

                <button className="nav-item">
                  <span className="nav-label">
                    Processed Files <b>{stats.me.processedFiles}</b>
                  </span>
                </button>
              </div>
            )}

            {/* SETTINGS */}
            <div className="nav-section">
              <div className="nav-section-title">Settings</div>

              <button
                className="nav-item"
                onClick={() => {
                  navigate("/settings");
                  setIsSidebarOpen(false);
                }}
              >
                <span className="nav-icon" id="ho"><CgProfile /></span>
                <span className="nav-label">Profile</span>
              </button>

              {user.company_name && (
                <button
                  className="nav-item"
                  onClick={() => {
                    setShowInvite(true);
                    setIsSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon" ><FaUsers /></span>
                  <span className="nav-label">Invite to Join</span>
                </button>
              )}
            </div>

          </nav>
        </aside>

        {/* DARK BACKDROP */}
        {isSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

      {/* Main Content Area */}
        <main className="dashboard-main">
          <div className="main-content">
            {/* Welcome Section */}
            <div className="welcome">
            <section className="welcome-section">
              <h1 className="welcome-title">
               Hi {user.firstName}, Welcome to Cloud360
              </h1>
              <p className="welcome-subtitle">
                {user.isCompany
                  ? "Manage your company's data, files, and workflows in one powerful platform."
                  : "Your centralized platform for data management and file processing."}
              </p>
            </section>
            </div>
 
            {/* Intro Card (like Databricks) */}
            <section className="intro-card">
              <div className="intro-content">
                <h2 className="intro-title">Getting Started with Cloud360</h2>
                <p className="intro-description">
                  Explore our powerful features to upload, process, and manage your data seamlessly.
                  Connect to various data sources and build your first data pipeline in minutes.
                </p>
              </div>
              <div className="intro-visual">
                <div className="intro-placeholder">
                  <span className="visual-icon">🚀</span>
                </div>
              </div>
            </section>
 
            {/* Connect Your Data Section */}
            <section className="data-section">
              <h2 className="section-title">Connect your data</h2>
              <div className="action-cards">
                <div
                  className="action-card"
                  onClick={() => navigate("/u-p2q8k4r9jw")}
                >
                  <div className="card-icon">⬆️</div>
                  <h3 className="card-title">Upload data</h3>
                  <p className="card-description">
                    Upload files from your local system and process them instantly.
                  </p>
                </div>
 
                <div
                  className="action-card"
                  onClick={() => navigate("/cf-2g7h9k3l5m")}
                >
                  <div className="card-icon">📁</div>
                  <h3 className="card-title">Browse datasets</h3>
                  <p className="card-description">
                    View and manage all your uploaded files and datasets.
                  </p>
                </div>
 
                <div
                  className="action-card"
                  onClick={() => navigate("/f-vxt2x3s7a1")}
                >
                  <div className="card-icon">🔗</div>
                  <h3 className="card-title">Connect to API data sources</h3>
                  <p className="card-description">
                    Integrate with external APIs and data sources seamlessly.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Chatbot />
      <Footer />

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
    </>
  );
}

export default Dashboard;
