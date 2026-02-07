import React, { useState } from "react";
import axios from "axios";
import { auth, googleProvider, signInWithPopup } from "./firebase";
import "./Register.css";
import Swal from "sweetalert2";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { FaChartLine,FaBrain,FaCloud,FaChartBar,FaMicrochip} from "react-icons/fa";
 
function Register({ setUser }) {
  const navigate = useNavigate();
 
  // ===============================
  // HELPERS
  // ===============================
  const isPersonalEmail = (email) => {
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
    if (!email.includes("@")) return false;
 
    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
  };
 
  // ===============================
  // STATE
  // ===============================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
 
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
 
  // ===============================
  // SEND OTP
  // ===============================
  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !password ||
      !confirmPassword
    ) {
      Swal.fire("Error", "Please fill in all fields.", "error");
      return;
    }
 
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match.", "error");
      return;
    }
 
    if (!agreeTerms) {
      Swal.fire("Error", "You must accept Terms & Conditions.", "error");
      return;
    }
 
    const trimmedEmail = email.trim().toLowerCase();
 
    // 🚫 BLOCK COMPANY EMAILS
    if (!isPersonalEmail(trimmedEmail)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Only Gmail, Yahoo, or Outlook emails are allowed for Normal registration.",
      });
      return;
    }
 
    try {
      setLoading(true);
 
      const res = await axios.post(
        "http://localhost:5000/send-otp",
        { email: trimmedEmail },
        { headers: { "Content-Type": "application/json" } },
      );
 
      if (res.data.success) {
        Swal.fire("OTP Sent", "Check your email for OTP", "success");
        setOtpSent(true);
        setMessage("");
      } else {
        Swal.fire("Error", res.data.error || "Failed to send OTP", "error");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
 
      if (err.response?.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Already Registered",
          text: "Redirecting to login...",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // ❌ Other errors
        Swal.fire(
          "Error",
          err.response?.data?.error || "Server error while sending OTP",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };
 
  // ===============================
  // VERIFY OTP & REGISTER
  // ===============================
  const handleVerifyOtp = async () => {
    if (!otp) {
      Swal.fire("Error", "Enter the OTP you received.", "error");
      return;
    }
 
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedOtp = otp.trim();
 
      const verifyRes = await axios.post(
        "http://localhost:5000/verify-otp",
        { email: trimmedEmail, otp: trimmedOtp },
        { headers: { "Content-Type": "application/json" } },
      );
 
      if (verifyRes.data.success) {
        const registerRes = await axios.post(
          "http://localhost:5000/register",
          { firstName, lastName, email: trimmedEmail, mobile, password },
          { headers: { "Content-Type": "application/json" } },
        );
 
        if (registerRes.data.success) {
          Swal.fire(
            "Success",
            "Registration successful! Please login.",
            "success",
          );
          navigate("/login");
        } else {
          Swal.fire(
            "Error",
            registerRes.data.error || "Registration failed.",
            "error",
          );
        }
      } else {
        Swal.fire("Error", "Invalid or expired OTP.", "error");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "OTP verification error",
        "error",
      );
    }
  };
 
  // ===============================
  // GOOGLE SIGN IN
  // ===============================
  const handleGoogleSignIn = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
 
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const firebaseToken = await user.getIdToken();
 
      const res = await axios.post("http://localhost:5000/google-login", {
        token: firebaseToken,
      });
 
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
 
      // 🔥 THIS WAS MISSING
      setUser(res.data.user);
 
      Swal.fire({
        title: "Login Successful!",
        text: "Redirecting to your dashboard...",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });
 
      navigate("/d-oxwilh9dy1", { replace: true });
    } catch (err) {
      console.error("Google sign-in error:", err);
      Swal.fire("Error", "Google sign-in failed", "error");
    }
  };
 
  // ===============================
  // UI
  // ===============================
  return (
    <>
      <div className="register-container">
        {/* <div className="register-image-section">
          <img src={registerImage} alt="Register illustration" />
        </div>
  */}
        <div className="register-page">
          <div className="hero-text">
            <div className="hero-title">
              <h1>Cloud360</h1>
            </div>
 
            <p>
              Begin your journey with intelligent data
 
              <br />
           and smarter decisions.
            </p>
            <br />
            <div className="icon-group">
              <div className="icon-card">
                <FaChartLine className="hero-icon" />
                <span>Analytics</span>
              </div>
 
              <div className="icon-card">
                <FaBrain className="hero-icon" />
                <span>AI Engine</span>
              </div>
 
              <div className="icon-card">
                <FaChartBar className="hero-icon" />
                <span>Insights</span>
              </div>
            </div>
          </div>
          <div className="register-box">
            <h2>Create Account</h2>
 
            {!otpSent ? (
              <>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
 
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
 
                <div className="form-row">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
 
                <div className="terms">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label>I agree to the Terms & Conditions</label>
                </div>
 
                <button
                  onClick={handleRegister}
                  className="register-btn"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Sign up"}
                </button>
              </>
            ) : (
              <div className="otp-section">
                <h3>Enter OTP sent to your email</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="______"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="otp-input"
                  maxLength="6"
                />
                <button onClick={handleVerifyOtp} className="verify-btn">
                  Verify & Create Account
                </button>
                <p>{message}</p>
              </div>
            )}
 
            <div className="divider">OR</div>
 
            <button className="google-btn" onClick={handleGoogleSignIn}>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
              Sign Up with Google
            </button>
            <br />
            <button
              className="company-register-btn"
              onClick={() => navigate("/cr-h2k8j5d1f5")}
            >
              Register as Company
            </button>
          </div>
        </div>
      </div>
 
      {/* <Footer /> */}
    </>
  );
}
 
export default Register;
 
 