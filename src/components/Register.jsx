import React, { useState } from 'react';
import axios from 'axios';
import {
  auth,
  googleProvider,
  signInWithPopup,
} from './firebase';
import './Register.css';
import registerImage from '../assets/art3.png';
import Swal from 'sweetalert2';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate(); // ✅ ADD THIS

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  // ===============================
  // SEND OTP
  // ===============================
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      alert('You must accept Terms & Conditions.');
      return;
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();

      const res = await axios.post(
        'http://localhost:5000/send-otp',
        { email: trimmedEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        alert('✅ OTP sent to your Gmail. Please check your inbox.');
        setOtpSent(true);
        setMessage('');
      } else {
        alert(res.data.error || '❌ Failed to send OTP. Try again.');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert(err.response?.data?.error || 'Server error while sending OTP');
    }
  };

  // ===============================
  // VERIFY OTP & REGISTER
  // ===============================
  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Enter the OTP you received.');
      return;
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedOtp = otp.trim();

      const verifyRes = await axios.post(
        'http://localhost:5000/verify-otp',
        { email: trimmedEmail, otp: trimmedOtp },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (verifyRes.data.success) {
        const registerRes = await axios.post(
          'http://localhost:5000/register',
          { firstName, lastName, email: trimmedEmail, mobile, password },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (registerRes.data.success) {
          alert('✅ Registration successful! Please login.');
          navigate('/login'); // ✅ FIXED HERE
        } else {
          alert(registerRes.data.error || '❌ Registration failed. Try again.');
        }
      } else {
        alert('❌ Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      alert(err.response?.data?.error || 'OTP verification error');
    }
  };

  // ===============================
  // GOOGLE SIGN IN (UNCHANGED)
  // ===============================
  const handleGoogleSignIn = async () => {
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const firebaseToken = await user.getIdToken();

      const res = await axios.post('http://localhost:5000/google-login', {
        token: firebaseToken,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      Swal.fire({
        title: 'Login Successful!',
        text: 'Redirecting to your dashboard...',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false,
      });

      navigate('/d-oxwilh9dy1'); // dashboard for Google login

    } catch (err) {
      console.error('Google sign-in error:', err);
      Swal.fire('Error', 'Google sign-in failed', 'error');
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-image-section">
          <img src={registerImage} alt="Register illustration" />
        </div>

        <div className="register-page">
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

                <button onClick={handleRegister} className="register-btn">
                  Send OTP
                </button>
              </>
            ) : (
              <div className="otp-section">
                <h3>Enter OTP sent to your email</h3>
                <input
                  type="text"
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

            <button
              className="company-register-btn"
              onClick={() => navigate('/cr-h2k8j5d1f5')}
            >
              Register as Company
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Register;
