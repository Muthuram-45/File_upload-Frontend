import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./components/firebase";

import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ApiFetcher from "./components/FetchApi";
import Upload from "./components/Upload";
import ForgotPassword from "./components/ForgotPassword";
import ChangePassword from "./components/ChangePassword";
import ChangeName from "./components/ChangeName";
import ChangeMobile from "./components/ChangeMobile";
import CompanyRegister from "./components/CompanyRegister";
import CompanyLogin from "./components/CompanyLogin";
import CompanyFiles from "./components/CompanyFiles";
import ProcessedView from "./components/ProcessedView";
import Navbar from "./components/Navbar";
import SettingsPage from "./components/SettingsPage";
import ChartsView from "./components/ChartsView";
import InviteRedirect from "./components/InviteRedirect";

import "./app.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // AUTH STATE (KEEP AS IS)
  // ============================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (localUser && token) {
        setUser(localUser);
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        try {
          const res = await fetch(
            `http://localhost:5000/user/${firebaseUser.email}`
          );
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        } catch {}
        setLoading(false);
        return;
      }

      setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  // ============================
  // 🔥 FIXED PROTECTED ROUTE
  // ============================
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    // ❌ ONLY BLOCK IF NO TOKEN
    if (!token) {
      return <Navigate to="/l-gy5n8r4v2t" replace />;
    }

    // ✅ DO NOT BLOCK viewOnly HERE
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (user) {
      return <Navigate to="/d-oxwilh9dy1" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />

      <div className="App" style={{ marginTop: "80px" }}>
        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to={user ? "/d-oxwilh9dy1" : "/l-gy5n8r4v2t"}
                replace
              />
            }
          />

          {/* PUBLIC */}
          <Route
            path="/l-gy5n8r4v2t"
            element={
              <PublicRoute>
                <Login setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/r-ya7w1p9s35"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/cl-zv9ng4q6b8"
            element={<CompanyLogin setUser={setUser} />}
          />
          <Route
            path="/cr-h2k8j5d1f5"
            element={<CompanyRegister />}
          />

          {/* PROTECTED (VIEW USERS ALLOWED) */}
          <Route
            path="/d-oxwilh9dy1"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cf-2g7h9k3l5m"
            element={
              <ProtectedRoute>
                <CompanyFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p-h7t4k9m3zq"
            element={
              <ProtectedRoute>
                <ProcessedView />
              </ProtectedRoute>
            }
          />

          {/* 🔥 IMPORTANT: PAGES MUST LOAD */}
          <Route
            path="/u-p2q8k4r9jw"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/f-vxt2x3s7a1"
            element={
              <ProtectedRoute>
                <ApiFetcher />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

<<<<<<< HEAD
=======
          <Route
            path="/p-h7t4k9m3zq"
            element={
              <ProtectedRoute allowViewOnly>
                <ProcessedView />
              </ProtectedRoute>
            }
          />



>>>>>>> 670cca49ea157781fbf24512987969ca59e1f53a
          {/* OTHER */}
          <Route path="/invite-redirect" element={<InviteRedirect />} />
          <Route path="/charts-view" element={<ChartsView />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
