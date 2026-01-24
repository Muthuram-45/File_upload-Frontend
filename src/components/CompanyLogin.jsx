import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./CompanyLogin.css";

import Footer from "./Footer";

function CompanyLogin({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState(""); // ✅ KEEP
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =========================
  // HANDLE COMPANY LOGIN
  // =========================
  const handleLogin = async () => {
    if (!email || !password || !companyName) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);

      // ❌ DO NOT SEND company_name
      const res = await axios.post("http://localhost:5000/company-login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (!res.data.success) {
        Swal.fire("Error", res.data.error || "Login failed", "error");
        return;
      }

      // =========================
      // ✅ COMPANY NAME VALIDATION
      // =========================
      const backendCompany = res.data.user.company_name?.toLowerCase().trim();
      const inputCompany = companyName.toLowerCase().trim();

      if (backendCompany !== inputCompany) {
        Swal.fire(
          "Access Denied",
          "Company name does not match this account",
          "error"
        );
        return;
      }

      // =========================
      // ✅ TRUST BACKEND ROLE
      // =========================
      const userData = {
        id: res.data.user.id,
        email: res.data.user.email,
        firstName: res.data.user.firstName || "",
        lastName: res.data.user.lastName || "",
        mobile: res.data.user.mobile || "",
        company_name: res.data.user.company_name,
        role: res.data.user.role,        // manager / employee
        isCompany: true,
        viewOnly: false,
      };

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      Swal.fire({
        title: "Login Successful",
        text: `Welcome ${userData.company_name}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/d-oxwilh9dy1", { replace: true });

    } catch (err) {
      console.error("Company Login Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Server error during login",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container" x>
        {/* LEFT FORM */}
        <div className="login-form-section">
          <div className="login-box">
            <h2 className="login-title">Company Login</h2>
            <p className="login-subtitle">Access your company dashboard</p>

            {/* ✅ COMPANY NAME INPUT */}
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="login-input"
            />

            <input
              type="email"
              placeholder="Company Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />

            <button
              onClick={handleLogin}
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="footer-text">
              New company?{" "}
              <span
                onClick={() => navigate("/cr-h2k8j5d1f5")}
                className="register-link"
              >
                Register here
              </span>
            </p>

            <p className="footer-text">
              Normal User?{" "}
              <span
                onClick={() => navigate("/l-gy5n8r4v2t")}
                className="register-link"
              >
                Login here
              </span>
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}

export default CompanyLogin;
