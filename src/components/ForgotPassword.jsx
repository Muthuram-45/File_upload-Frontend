import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ForgotPassword.css';
import { BASE_API_URL } from "../apiConfig";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire('Error', 'Please enter your email', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire('Success', 'OTP sent to your email!', 'success');
        setOtpSent(true);
      } else {
        Swal.fire('Error', data.error || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      Swal.fire('Error', 'Unable to send OTP. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire('Success', 'Password reset successfully!', 'success');
        navigate('/l-gy5n8r4v2t'); // Redirect to login
      } else {
        Swal.fire('Error', data.error || 'Password reset failed', 'error');
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      Swal.fire('Error', 'Unable to reset password. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container" style={{ minHeight: '100vh', position: 'relative' }}>
       <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
        }}
      >
        <button
          className="backk-btns"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="forgot-password-form">
        <h2>Forgot Password</h2>

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
