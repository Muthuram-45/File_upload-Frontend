import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import registerImage from '../assets/art3.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
 
const API_BASE = "http://localhost:5000";
 
function CompanyRegister() {
  const navigate = useNavigate();
 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
 
  // ======================================================
  // 🔥 COMPANY EMAIL VALIDATION
  // ======================================================
  const validateCompanyEmail = (company, email) => {
    if (!company || !email || !email.includes("@")) return false;
 
    const domain = email.split("@")[1].toLowerCase();
 
    // block personal email providers
    const blockedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    if (blockedDomains.includes(domain)) return false;
 
    const normalizedCompany = company
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
 
    return domain === `${normalizedCompany}.com`;
  };
 
  // ======================================================
  // 1️⃣ SEND OTP
  // ======================================================
  const handleSendOtp = async () => {
    setEmailError("");
 
    if (!firstName || !lastName || !companyName || !email || !mobile || !password || !confirmPassword) {
      Swal.fire('Error', 'Please fill in all fields.', 'error');
      return;
    }
 
    if (password !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match.', 'error');
      return;
    }
 
    if (!agreeTerms) {
      Swal.fire('Error', 'You must accept Terms & Conditions.', 'error');
      return;
    }
 
    const valid = validateCompanyEmail(companyName, email);
    if (!valid) {
      const companyDomain = companyName
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
 
      setEmailError(`Use company email like name@${companyDomain}.com`);
      return;
    }
 
    try {
      setLoading(true); // 🔥 START LOADING
 
      const res = await axios.post(`${API_BASE}/send-otp`, { email });
 
      if (res.data.success) {
        setMessage('OTP has been sent to your registered company email.');
        Swal.fire('OTP Sent', 'Please check your company email inbox.', 'success');
        setOtpSent(true);
      } else {
        Swal.fire('Error', 'Failed to send OTP. Try again.', 'error');
      }
 
    } catch (err) {
      console.error('OTP send error:', err);
 
      if (err.response?.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Already Registered',
          text: 'Redirecting to login...',
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate('/cl-zv9ng4q6b8'), 2000);
      } else {
        Swal.fire("Server Error", "Could not send OTP.", "error");
      }
 
    } finally {
      setLoading(false); // 🔥 STOP LOADING
    }
  };
 
  // ======================================================
  // 2️⃣ VERIFY OTP + REGISTER COMPANY
  // ======================================================
  const handleVerifyOtp = async () => {
    if (!otp) {
      Swal.fire('Error', 'Enter the OTP you received.', 'error');
      return;
    }
 
    try {
      const res = await axios.post(`${API_BASE}/verify-otp`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
 
      if (res.data.success) {
        await axios.post(`${API_BASE}/company-register`, {
          firstName,
          lastName,
          company_name: companyName,
          email,
          mobile,
          password,
        });
 
        Swal.fire({
          title: '✅ Company Registered Successfully!',
          text: 'Redirecting to Company Login...',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
 
        setTimeout(() => {
          navigate('/cl-zv9ng4q6b8');
        }, 2000);
      } else {
        Swal.fire('Error', 'Invalid or expired OTP.', 'error');
      }
    } catch (err) {
      console.error('Company registration error:', err);
      Swal.fire(
        'Error',
        err.response?.data?.error || 'Server error during registration.',
        'error'
      );
    }
  };
 
  return (
    <>
      <div className="register-container">
        <div className="register-image-section">
          <img src={registerImage} alt="Company Register illustration" />
        </div>
 
        <div className="register-page">
          <div className="register-box">
            <h2>Company Registration</h2>
 
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
 
                <div className="form-row email-field">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
 
                  <input
                    type="email"
                    placeholder="Company Email (name@company.com)"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                  />
 
                  {emailError && (
                    <div className="input-tooltip">
                      ⚠️ {emailError}
                    </div>
                  )}
                </div>
 
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
 
                <div className="form-row">
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
                  onClick={handleSendOtp}
                  className="register-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
 
                {message && (
                  <p style={{ color: 'gray', marginTop: '10px' }}>{message}</p>
                )}
 
                <p className="already-account">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate('/cl-zv9ng4q6b8')}
                    style={{ color: '#007bff', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Login here
                  </span>
                </p>
              </>
            ) : (
              <div className="otp-section">
                <h3>Enter OTP sent to {email}</h3>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="otp-input"
                  maxLength="6"
                />
                <button onClick={handleVerifyOtp} className="verify-btn">
                  Verify & Register Company
                </button>
                {message && (
                  <p style={{ color: 'gray', marginTop: '10px' }}>{message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
 
      <Footer />
    </>
  );
}
 
export default CompanyRegister;