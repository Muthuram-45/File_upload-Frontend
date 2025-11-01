import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';

function ChangePassword() {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('❌ New passwords do not match');
      return;
    }

    try {
      const res = await fetch('https://file-upload-backend-9.onrender.com/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Password changed successfully');
        navigate('/dashboard');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Something went wrong');
    }
  };

  return (
    <div className="change-password-container">
      <form className="change-password-form" onSubmit={handleChangePassword}>
        <h2>Change Password</h2>

        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Update Password</button>

        <p className="back-link" onClick={() => navigate('/dashboard')}>
          🔙 Back 
        </p>
      </form>
    </div>
  );
}

export default ChangePassword;
