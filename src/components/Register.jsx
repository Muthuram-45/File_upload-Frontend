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

function Register() {
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

  // ✅ Handle normal registration using Gmail OTP
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
    if (err.response) {
      // Backend responded with an error message
      alert(`⚠️ ${err.response.data?.error || 'Failed to send OTP. Please check your email.'}`);
    } else if (err.request) {
      // Request made but no response received
      alert('❌ No response from server. Please check your internet or backend.');
    } else {
      // Other client-side errors
      alert('⚠️ Unexpected error while sending OTP.');
    }
  }
};

// ✅ Verify Gmail OTP
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
        alert('✅ Registration successful!');
        window.location.href = '/d-oxwilh9dy1';
      } else {
        alert(registerRes.data.error || '❌ Registration failed. Try again.');
      }
    } else {
      alert('❌ Invalid or expired OTP. Please try again.');
    }
  } catch (err) {
    console.error('OTP verification failed:', err);
    if (err.response) {
      alert(`⚠️ ${err.response.data?.error || 'Invalid OTP or server error'}`);
    } else if (err.request) {
      alert('❌ No response from server during OTP verification.');
    } else {
      alert('⚠️ Unexpected error during OTP verification.');
    }
  }
};

const handleGoogleSignIn = async () => {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });

    // Step 1: Google popup
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const firebaseToken = await user.getIdToken();

    console.log('Google ID Token:', firebaseToken);

    // ✅ Step 2: Send to backend (match key name)
    const res = await axios.post('http://localhost:5000/google-login', {
      token: firebaseToken, // 🔹 now matches backend
    });

    // ✅ Step 3: Store locally
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    // ✅ Step 4: Redirect
    Swal.fire({
      title: 'Login Successful!',
      text: 'Redirecting to your dashboard...',
      icon: 'success',
      timer: 5000,
      showConfirmButton: false,
    });

    // Optionally redirect after delay
    // setTimeout(() => {
    //   window.location.href = '/dashboard';
    // }, 2000);

  } catch (err) {
    console.error('Google sign-in error:', err);
    // Swal.fire('Error', 'Google sign-in failed. Please try again.', 'error');
  }
};

  return (
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

          {/* 🔹 New Company Register Button */}
          <button
            className="company-register-btn"
            onClick={() => (window.location.href = '/cr-h2k8j5d1f5')}
          >
            Register as Company
          </button>
        </div>
      </div>

      <Footer/>

    </div>

  );
}

export default Register;
