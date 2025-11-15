import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import registerImage from '../assets/art3.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

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

  // ✅ Step 1: Send OTP
  const handleSendOtp = async () => {
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

    try {
      const res = await axios.post('http://localhost:5000/send-otp', { email });
      if (res.data.success) {
        setMessage('OTP has been sent to your registered email.');
        Swal.fire('OTP Sent', 'Please check your Gmail inbox.', 'success');
        setOtpSent(true);
      } else {
        setMessage('Failed to send OTP.');
        Swal.fire('Error', 'Failed to send OTP. Try again.', 'error');
      }
    } catch (err) {
      console.error('OTP send error:', err);
      setMessage('Server error while sending OTP.');
      Swal.fire('Server Error', 'Could not send OTP.', 'error');
    }
  };

  // ✅ Step 2: Verify OTP and Register Company
  const handleVerifyOtp = async () => {
    if (!otp) {
      Swal.fire('Error', 'Enter the OTP you received.', 'error');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (res.data.success) {
        await axios.post('http://localhost:5000/company-register', {
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

        // ✅ Redirect to company login page
        setTimeout(() => {
          navigate('/cl-zv9ng4q6b8');
        }, 2000);
      } else {
        setMessage('Invalid or expired OTP.');
        Swal.fire('Error', 'Invalid or expired OTP. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Company registration error:', err);
      setMessage('Server error during registration.');
      Swal.fire('Error', 'Server error during registration.', 'error');
    }
  };

  return (
    <div className="register-container">
      <div className="register-image-section">
        <img src={registerImage} alt="Company Register illustration" />
      </div>

      <div className="register-page">
        <div className="register-box">
          <h2>Company Registration</h2>

          {!otpSent ? (
            <>
              {/* 🔹 Name Inputs */}
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
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Company Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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

              <button onClick={handleSendOtp} className="register-btn">
                Send OTP
              </button>

              {message && <p style={{ color: 'gray', marginTop: '10px' }}>{message}</p>}

              {/* 🔹 Already have an account */}
              <p className="already-account">
                Already have an account?{' '}
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
              {message && <p style={{ color: 'gray', marginTop: '10px' }}>{message}</p>}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default CompanyRegister;
