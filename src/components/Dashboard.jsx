import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import InviteEmployee from "./InviteEmployee";
 
// Icons
import { FaUsers, FaCogs, FaBolt, FaFileAlt } from "react-icons/fa";
import { IoHome, IoCloudDone } from "react-icons/io5";
import { SiFiles } from "react-icons/si";
import { CgProfile } from "react-icons/cg";
import { BsPersonFillAdd } from "react-icons/bs";
 
 
const API_BASE = "http://localhost:5000";
 
function Dashboard() {
  const navigate = useNavigate();
 
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  // 🔥 VIEW STATE
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [activeView, setActiveView] = useState("home"); // home | approvals
 
  function capitalizeFirstLetter(name = "") {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
 
 
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
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
          <nav className="sidebar-nav">
 
            <div className="nav-group">
              <button
                className={`nav-item ${activeView === "home" ? "active" : ""}`}
                onClick={() => {
                  setActiveView("home");
                  navigate("/d-oxwilh9dy1");
                }}
              >
                <span className="nav-icon"><IoHome /></span>
                <span className="nav-label">Home</span>
              </button>
 
              <button
                className="nav-item"
                onClick={() => navigate("/cf-2g7h9k3l5m")}
              >
                <span className="nav-icon"><SiFiles /></span>
                <span className="nav-label">All Files</span>
              </button>
            </div>
 
            <div className="nav-group">
              <div className="nav-group-title">My Works</div>
              <button className="nav-item">
                <span className="nav-icon"><IoCloudDone /></span>
                <span className="nav-label">Uploaded</span>
                <span className="count-badge">{stats.me.uploadedFiles}</span>
              </button>
              <button className="nav-item">
                <span className="nav-icon"><FaBolt /></span>
                <span className="nav-label">API</span>
                <span className="count-badge">{stats.me.uploadedApi}</span>
              </button>
              <button className="nav-item">
                <span className="nav-icon"><FaCogs /></span>
                <span className="nav-label">Processed</span>
                <span className="count-badge">{stats.me.processedFiles}</span>
              </button>
            </div>
 
            {isManager && stats.company && (
              <div className="nav-group">
                <div className="nav-group-title">Company Works</div>
                <button className="nav-item">
                  <span className="nav-icon"><IoCloudDone /></span>
                  <span className="nav-label">Uploaded</span>
                  <span className="count-badge">{stats.company.uploadedFiles}</span>
                </button>
                <button className="nav-item">
                  <span className="nav-icon"><FaBolt /></span>
                  <span className="nav-label">API</span>
                  <span className="count-badge">{stats.company.uploadedApi}</span>
                </button>
                <button className="nav-item">
                  <span className="nav-icon"><FaCogs /></span>
                  <span className="nav-label">Processed</span>
                  <span className="count-badge">{stats.company.processedFiles}</span>
                </button>
              </div>
            )}
 
            <div className="nav-group">
              <div className="nav-group-title">Settings</div>
 
              <button
                className="nav-item"
                onClick={() => navigate("/settings")}
              >
                <span className="nav-icon"><CgProfile /></span>
                <span className="nav-label">Profile</span>
              </button>
 
              <button
                className="nav-item"
                onClick={() => navigate("/settings?section=dailyReport")}
              >
                <span className="nav-icon"><FaFileAlt /></span>
                <span className="nav-label">Daily Report</span>
              </button>
 
              {isManager && (
                <>
                  {/* 🔥 PENDING APPROVALS MENU */}
                  <button
                    className={`nav-item ${activeView === "approvals" ? "active" : ""
                      }`}
                    onClick={() => setActiveView("approvals")}
                  >
                    <span className="nav-icon"><FaUsers /></span>
                    <span className="nav-label">Approvals</span>
                    {pendingEmployees.length > 0 && (
                      <span className="count-badge warning">
                        {pendingEmployees.length}
                      </span>
                    )}
                  </button>
 
                  <button
                    className="nav-item"
                    onClick={() => setShowInvite(true)}
                  >
                    <span className="nav-icon"><BsPersonFillAdd /></span>
                    <span className="nav-label">Invite User</span>
                  </button>
                </>
              )}
 
 
            </div>
 
            <small style={{ paddingLeft: "12px", color: "#9ca3af" }}>
              Reports are emailed daily
            </small>
 
          </nav>
        </aside>
 
        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          <div className="main-content">
 
            {/* WELCOME HEADER */}
            <div className="welcome-header">
              <div className="welcome-text">
                <h1 className="welcome-title">
                  Welcome, <span className="highlight-text">
                    {capitalizeFirstLetter(user.firstName)}!
                  </span>
 
                </h1>
                <p className="welcome-subtitle">
                  Manage your data, files, and workflows in one powerful platform
                </p>
              </div>
            </div>
 
            {/* ACTION CARDS - Only show on 'home' view */}
            {activeView === 'home' && (
              <div className="dashboard-cards">
                {/* CARD 1: UPLOAD DATA */}
                <div className="dash-card">
                  <div className="card-image-bg blue-bg">
                    <img
                      src="src/assets/icons/upload-cloud.svg"
                      className="card-3d-icon"
                      alt="Upload Data"
                    />
 
                  </div>
                  <h3 className="card-heading">Upload Data</h3>
                  <p className="card-text">Upload files securely from your system</p>
                  <button
                    className="card-btn blue-btn"
                    onClick={() => navigate("/u-p2q8k4r9jw")}
                  >
                    Upload Data
                  </button>
                </div>
 
                {/* CARD 2: BROWSE DATASETS */}
                <div className="dash-card">
                  <div className="card-image-bg green-bg">
                    <img
                      src="src/assets/icons/database-stack.svg"
                      className="card-3d-icon"
                      alt="Browse Datasets"
                    />
 
                  </div>
                  <h3 className="card-heading">Browse Datasets</h3>
                  <p className="card-text">View and manage all processed datasets</p>
                  <button
                    className="card-btn green-btn"
                    onClick={() => navigate("/cf-2g7h9k3l5m")}
                  >
                    Browse Datasets
                  </button>
                </div>
 
                {/* CARD 3: CONNECT API */}
                <div className="dash-card">
                  <div className="card-image-bg purple-bg">
                    <img
                      src="src/assets/icons/api-plug.svg"
                      className="card-3d-icon"
                      alt="Connect API"
                    />
 
                  </div>
                  <h3 className="card-heading">Connect API</h3>
                  <p className="card-text">Integrate data using secure APIs</p>
                  <button
                    className="card-btn purple-btn"
                    onClick={() => navigate("/f-vxt2x3s7a1")}
                  >
                    Connect API
                  </button>
                </div>
              </div>
            )}
 
 
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
                          {capitalizeFirstLetter(emp.first_name)?.charAt(0)}
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
 
 