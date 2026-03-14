import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangeMobile.css';

function ChangeMobile() {
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();

  // ✅ Get logged-in user info (Normal user or Google user)
  const storedUser =
    JSON.parse(localStorage.getItem('user')) ||
    JSON.parse(localStorage.getItem('googleUserInfo'));

  const email = storedUser?.email;  // 👉 Auto-filled email (no need input)

  const handleChangeMobile = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("❌ No user logged in");
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/change-mobile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Mobile number updated successfully');

        // ✅ Update localStorage
        storedUser.mobile = mobile;

        if (storedUser.isGoogleUser) {
          localStorage.setItem('googleUserInfo', JSON.stringify(storedUser));
        } else {
          localStorage.setItem('user', JSON.stringify(storedUser));
        }

        // Notify dashboard
        window.dispatchEvent(new Event('storage'));

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
    <div className="change-mobile-container">
      <form className="change-mobile-form" onSubmit={handleChangeMobile}>
        <h2>Change Mobile</h2>

        {/* ❌ Email input removed */}

        <input
          type="text"
          placeholder="Enter New Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <button type="submit">Update Mobile</button>
      </form>
    </div>
  );
}

export default ChangeMobile;
