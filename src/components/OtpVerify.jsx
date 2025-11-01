import React, { useState } from 'react';
import axios from 'axios';
import './OtpVerify.css';
import { useNavigate } from 'react-router-dom';

function OtpVerify() {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    const email = localStorage.getItem('email');
    if (!otp) return alert('Enter OTP');
    if (!email) return alert('Session expired. Please register again.');

    try {
      const res = await axios.post('https://file-upload-backend-9.onrender.com/verify-otp', { email, otp });
      alert(res.data.message);
      localStorage.removeItem('email');
      navigate('/login');
    } catch (err) {
      console.error('❌ OTP verification error:', err);
      alert(err.response?.data?.error || 'Invalid OTP.');
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-box">
        <h2>Enter OTP</h2>
        <p>We sent an OTP to your Gmail</p>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={handleVerify}>Verify OTP</button>
      </div>
    </div>
  );
}

export default OtpVerify;
