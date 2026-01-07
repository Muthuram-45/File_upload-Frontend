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

const API_BASE = "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  

  // 🔥 NEW
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [activeView, setActiveView] = useState("home"); // home | approvals

  // ======================================================
  // 1️⃣ LOAD USER + TOKEN VALIDATION
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
      navigate("/l-gy5n8r4v2t", { replace: true });
      return;
    }

    fetch(`${API_BASE}/dashboard-counts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("unauthorized");
        }
        return res.json();
      })
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
        localStorage.clear();
        navigate("/l-gy5n8r4v2t", { replace: true });
      });
  }, [navigate]);

  // ======================================================
  // 3️⃣ LOAD PENDING EMPLOYEES (MANAGER ONLY)
  // ======================================================
  useEffect(() => {
    if (!user || user.role !== "manager") return;

    fetch(`${API_BASE}/manager/pending-employees`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPendingEmployees(data.employees || []);
      })
      .catch(() => setPendingEmployees([]));
  }, [user]);

  // ======================================================
  // 4️⃣ LOADING STATE
  // ======================================================
  if (!user || !stats) {
    return (
      <div className="dashboard-loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  const isManager = user.role === "manager";
  const isViewOnly = user.viewOnly === true;

  // ======================================================
  // 5️⃣ APPROVE / REJECT
  // ======================================================
  const approveEmployee = async (id) => {
    await fetch(`${API_BASE}/manager/approve-employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId: id }),
    });

    setPendingEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const rejectEmployee = async (id) => {
    await fetch(`${API_BASE}/manager/reject-employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId: id }),
    });

    setPendingEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // ======================================================
  // 6️⃣ UI
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
                onClick={() => {
                  setActiveView("home");
                  navigate("/d-oxwilh9dy1");
                }}
              >
                <IoHome id="ho"/> Home
              </button>

              <button
                className="nav-item"
                onClick={() => navigate("/cf-2g7h9k3l5m")}
              >
                <SiFiles id="fi"/> All Files
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
                <CgProfile id="ho"/> Profile
              </button>

              {isManager && (
                <>
                  <button
                    className="nav-item"
                    onClick={() => setShowInvite(true)}
                  >
                    <FaUsers id="up" /> Invite to Join
                  </button>

                  {/* 🔥 PENDING APPROVALS MENU */}
                  <button
                    className={`nav-item ${activeView === "approvals" ? "active" : ""
                      }`}
                    onClick={() => setActiveView("approvals")}
                  >
                     Pending Approvals
                    {pendingEmployees.length > 0 && (
                      <span className="badge">
                        {pendingEmployees.length}
                      </span>
                    )}
                  </button>
                </>
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
                    ? "Manage your company's data, files, and workflows in one powerful platform.Explore our powerful features to upload, process, and manage your data seamlessly."
                    : "Your centralized platform for data management and file processing.Explore our powerful features to upload, process, and manage your data seamlessly."}
                </p>
              </section>
            </div>
 
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
                  <p className="card-subtitle">Supports both Single or multiple files,Once uploaded files will be validated and prepared for further processing.</p>
                </div>
                {/* FILES */}
                <div
                  className="action-card"
                  onClick={() => navigate("/cf-2g7h9k3l5m")}
                >
                  <div className="card-icon">📁</div>
                  <h3 className="card-title">Browse datasets</h3>
                  <p className="card-description">
                    Access all your uploaded datasets in one place.
                  </p>
                  <p className="card-subtitle">Track file details, upload status, processing progress, and download processed output files from a single dashboard.</p>
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
                  <p className="card-subtitle">Secure connections to public and private APIs with automated data processing and storage for analysis and reporting.</p>
                </div>
 
              </div>
            </section>
            

            {/* ================= APPROVALS VIEW ================= */}
            {activeView === "approvals" && isManager && (
              <section className="approval-section">
                <div className="approval-header">
                  <h2>Pending Employee Approvals</h2>
                  <span className="approval-subtitle">
                    Review and approve employees requesting access
                  </span>
                </div>

                {pendingEmployees.length === 0 ? (
                  <div className="approval-empty">
                    <span>🎉</span>
                    <p>No pending employee requests</p>
                  </div>
                ) : (
                  pendingEmployees.map((emp) => (
                    <div key={emp.id} className="approval-card">
                      <div className="approval-user">
                        <div className="avatar">
                          {emp.first_name?.charAt(0)}
                        </div>

                        <div className="user-info">
                          <h4>
                            {emp.first_name} {emp.last_name}
                          </h4>
                          <p className="email">{emp.email}</p>
                          <p className="mobile">{emp.mobile}</p>
                        </div>
                      </div>

                      <div className="approval-actions">
                        <button
                          className="approve-btn"
                          onClick={() => approveEmployee(emp.id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => rejectEmployee(emp.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </section>

            )}

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
