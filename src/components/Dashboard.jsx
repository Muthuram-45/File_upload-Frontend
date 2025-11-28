import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import "./Dashboard.css";
import Footer from "./Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      const companyUser = JSON.parse(localStorage.getItem("company"));
      const token = localStorage.getItem("token");

      // ✅ Company Login (Manual)
      if (companyUser && token) {
        setUser({ ...companyUser, isCompany: true });
        return;
      }

      // ✅ Google Login (Firebase)
      if (firebaseUser) {
        const email = firebaseUser.email;
        try {
          const res = await fetch(`http://localhost:5000/user/${email}`);
          const data = await res.json();

          if (data.success && data.user) {
            const latestUser = { ...data.user, isGoogleUser: true };
            setUser(latestUser);
            localStorage.setItem("googleUserInfo", JSON.stringify(latestUser));
          } else {
            const firstName = firebaseUser.displayName?.split(" ")[0] || "User";
            const lastName = firebaseUser.displayName?.split(" ")[1] || "";
            const googleUser = {
              firstName,
              lastName,
              email,
              mobile: "",
              isGoogleUser: true,
            };
            setUser(googleUser);
            localStorage.setItem("googleUserInfo", JSON.stringify(googleUser));
          }
        } catch (err) {
          console.error("Fetch latest Google user failed:", err);
        }
        return;
      }

      // ✅ Regular Login (JWT)
      if (localUser && token) {
        setUser(localUser);
        return;
      }

      // ❌ No valid user → redirect
      navigate("/login", { replace: true });
    });

    return () => unsubscribe();
  }, [navigate]);

  // Loader screen
  if (!user) {
    return (
      <div className="dashboard-loading">
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <>
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="content-box">
          <h2>
            Welcome, { user.firstName} 👋
          </h2>

          {user.isCompany ? (
            <p>Manage your company’s files and users efficiently.</p>
          ) : (
            <p>Manage your files efficiently — upload and process them easily.</p>
          )}

          <div className="dashboard-actions">
            <button
              className="dashboard-btn upload"
              onClick={() => navigate("/u-p2q8k4r9jw")}
            >
              ⬆️ Upload File
            </button>

            <button
              className="dashboard-btn view"
              onClick={() => navigate("/f-vxt2x3s7a1")}
            >
              ⚙️ API
            </button>

            <button
              className="dashboard-btn view"
              onClick={() => navigate("/cf-2g7h9k3l5m")}
            >
              📁 View Files
            </button>
          </div>
        </div>
      </div>
    </div>

<Footer/>

    </>
  );
}

export default Dashboard;
