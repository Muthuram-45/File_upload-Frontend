import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      alert('⚠️ Please fill all fields');
      return;
    }

    if (newPassword.length < 6) {
      alert('⚠️ Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      // Check if the response is valid JSON
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Invalid server response');
      }

      if (response.ok && data.success) {
        alert('✅ Password reset successfully!');
        navigate('/login');
      } else {
        alert(`❌ ${data.error || 'Password reset failed'}`);
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      alert('❌ Unable to reset password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">

       <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginLeft: '35px',
        }}
      >
        <button
          className="backk-btns"
          onClick={() => navigate('/d-oxwilh9dy1')}
        >
          Back
        </button>
        </div>

      <form className="forgot-password-form" onSubmit={handleReset}>
        <h2>Forgot Password </h2>

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
    </div>
  );
}

export default ForgotPassword;
