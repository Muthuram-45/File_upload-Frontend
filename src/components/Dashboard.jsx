import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import InviteEmployee from "./InviteEmployee";

import { FaUsers } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { SiFiles } from "react-icons/si";
import { CgProfile } from "react-icons/cg";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ======================================================
  // 1️⃣ LOAD USER (ONCE)
  // ======================================================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/l-gy5n8r4v2t", { replace: true });
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  // ======================================================
  // 2️⃣ LOAD DASHBOARD STATS
  // ======================================================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStats({
        me: { uploadedFiles: 0, uploadedApi: 0, processedFiles: 0 },
        company: null,
      });
      return;
    }

    fetch("http://localhost:5000/dashboard-counts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          me: data?.me ?? {
            uploadedFiles: 0,
            uploadedApi: 0,
            processedFiles: 0,
          },
          company: data?.company ?? null,
        });
      })
      .catch(() => {
        setStats({
          me: { uploadedFiles: 0, uploadedApi: 0, processedFiles: 0 },
          company: null,
        });
      });
  }, []);

  // ======================================================
  // 3️⃣ LOADING STATE
  // ======================================================
  if (!user || !stats) {
    return (
      <div className="dashboard-loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  // ======================================================
  // 4️⃣ ROLE CHECKS
  // ======================================================
  const isManager = user.role === "manager";
  const isViewOnly = user.viewOnly === true;

  // ======================================================
  // 5️⃣ UI
  // ======================================================
  return (
    <>
      <div className="professional-dashboard">
        {/* MOBILE MENU */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>

        {/* SIDEBAR */}
        <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <button
                className="nav-item"
                onClick={() => navigate("/d-oxwilh9dy1")}
              >
                <IoHome /> Home
              </button>

              <button
                className="nav-item"
                onClick={() => navigate("/cf-2g7h9k3l5m")}
              >
                <SiFiles /> All Files
              </button>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">My Works</div>
              <button className="nav-item">
                Uploaded <b>{stats.me.uploadedFiles}</b>
              </button>
              <button className="nav-item">
                API <b>{stats.me.uploadedApi}</b>
              </button>
              <button className="nav-item">
                Processed <b>{stats.me.processedFiles}</b>
              </button>
            </div>

            {isManager && stats.company && (
              <div className="nav-section">
                <div className="nav-section-title">Company Works</div>
                <button className="nav-item">
                  Uploaded <b>{stats.company.uploadedFiles}</b>
                </button>
                <button className="nav-item">
                  API <b>{stats.company.uploadedApi}</b>
                </button>
                <button className="nav-item">
                  Processed <b>{stats.company.processedFiles}</b>
                </button>
              </div>
            )}

            <div className="nav-section">
              <div className="nav-section-title">Settings</div>

              <button
                className="nav-item"
                onClick={() => navigate("/settings")}
              >
                <CgProfile /> Profile
              </button>

              {isManager && (
                <button
                  className="nav-item"
                  onClick={() => setShowInvite(true)}
                >
                  <FaUsers /> Invite to Join
                </button>
              )}
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          <div className="main-content">

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

            <section className="intro-card">
              <div className="intro-content">
                <h2 className="intro-title">Getting Started with Cloud360</h2>
                <p className="intro-description">
                  Explore our powerful features to upload, process, and manage your data seamlessly.
                </p>
              </div>
              <div className="intro-visual">
                <div className="intro-placeholder">
                  <span className="visual-icon">🚀</span>
                </div>
              </div>
            </section>

            {/* CONNECT DATA */}
            <section className="data-section">
              <h2 className="section-title">Connect your data</h2>
              <div className="action-cards">

                {/* ✅ UPLOAD – ALWAYS NAVIGATE */}
                <div
                  className="action-card"
                  onClick={() => navigate("/u-p2q8k4r9jw")}
                >
                  <div className="card-icon">⬆️</div>
                  <h3 className="card-title">Upload data</h3>
                  <p className="card-description">
                    {isViewOnly
                      ? "Login required to upload"
                      : "Upload files from your local system"}
                  </p>
                </div>

                {/* FILES */}
                <div
                  className="action-card"
                  onClick={() => navigate("/cf-2g7h9k3l5m")}
                >
                  <div className="card-icon">📁</div>
                  <h3 className="card-title">Browse datasets</h3>
                  <p className="card-description">
                    View and manage all your uploaded files
                  </p>
                </div>

                {/* ✅ API – ALWAYS NAVIGATE */}
                <div
                  className="action-card"
                  onClick={() => navigate("/f-vxt2x3s7a1")}
                >
                  <div className="card-icon">🔗</div>
                  <h3 className="card-title">Connect API</h3>
                  <p className="card-description">
                    {isViewOnly
                      ? "Login required to fetch API"
                      : "Connect to API data sources"}
                  </p>
                </div>

              </div>
            </section>
          </div>
        </main>
      </div>

      <Chatbot />
      <Footer />

      {showInvite && isManager && (
        <InviteEmployee onClose={() => setShowInvite(false)} />
      )}
    </>
  );
}

export default Dashboard;
