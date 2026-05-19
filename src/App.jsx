import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
import "./App.css";
import NLPResults from "./components/NLPResults";
import Subscription from "./components/Subscription";
import Support from "./components/Support";
import { BASE_API_URL } from "./apiConfig";
function App() {
  // 🔥 RESTORE USER IMMEDIATELY
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  // ============================
  // AUTH STATE (KEEP AS IS)
  // ============================
  // ============================
  // AUTH STATE (JWT ONLY)
  // ============================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    const fetchStatus = () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return;

      // 🕒 Cache-busting: Add unique timestamp to URL
      fetch(`${BASE_API_URL}/api/subscription-status?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser((prev) => {
              if (!prev) return prev;

              const updatedUser = {
                ...prev,
                subscription_plan: data.plan,
                subscription_expiry: data.expiry,
                isSubscriptionActive: data.isActive,
                status: data.status
              };

              // Simplified sync: Always update state and localStorage to be safe
              localStorage.setItem("user", JSON.stringify(updatedUser));
              return updatedUser;
            });
          } else if (data.accountInactive) {
            localStorage.clear();
            setUser(null);
            window.location.href = "/l-gy5n8r4v2t?error=account_inactive";
          }
        })
        .catch((err) => console.error("Failed to refresh subscription:", err))
        .finally(() => setLoading(false));
    };

    if (savedUser && token) {
      fetchStatus();

      // 🚀 Global listener for manual refreshes (from other components)
      const handleGlobalUpdate = () => fetchStatus();
      window.addEventListener('subscriptionUpdate', handleGlobalUpdate);

      const interval = setInterval(fetchStatus, 15000);

      return () => {
        clearInterval(interval);
        window.removeEventListener('subscriptionUpdate', handleGlobalUpdate);
      };
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);





  return (
    <Router>
      <NavbarWrapper user={user} setUser={setUser} />
      <div className="App" >
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
          {/* PUBLIC ROUTES */}
          <Route
            path="/l-gy5n8r4v2t"
            element={
              <PublicRoute user={user}>
                <Login setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/r-ya7w1p9s35"
            element={
              <PublicRoute user={user}>
                <Register setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute user={user}>
                <ForgotPassword />
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
          {/* PROTECTED ROUTES */}
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
          {/* OTHER */}
          <Route path="/invite-redirect" element={<InviteRedirect />} />
          <Route path="/charts-view" element={<ChartsView />} />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nlp-results"
            element={
              <ProtectedRoute>
                <NLPResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;

// ============================
// UTILITY COMPONENTS
// ============================
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) {
    return <Navigate to="/l-gy5n8r4v2t" replace />;
  }
  return children;
};

const PublicRoute = ({ children, user }) => {
  if (user) {
    return <Navigate to="/d-oxwilh9dy1" replace />;
  }
  return children;
};

function NavbarWrapper({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.status === 'EXPIRED') {
      const allowedPaths = [
        "/subscription",
        "/l-gy5n8r4v2t",
        "/cl-zv9ng4q6b8",
        "/d-oxwilh9dy1", // Dashboard
        "/settings",     // Settings & Profile
        "/invite-redirect"
      ];

      if (!allowedPaths.includes(location.pathname)) {
        Swal.fire({
          title: "Subscription Expired",
          text: "Your subscription has expired. Please renew to access this feature.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Go to Subscription",
          cancelButtonText: "Close",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          } else {
            navigate("/d-oxwilh9dy1"); // Send back to dashboard
          }
        });
      }
    }
  }, [user, location.pathname, navigate]);

  const hideNavbarRoutes = [
    "/l-gy5n8r4v2t",
    "/r-ya7w1p9s35",
    "/cl-zv9ng4q6b8",
    "/cr-h2k8j5d1f5",
    "/forgot-password",
  ];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return <Navbar user={user} setUser={setUser} />;
}
