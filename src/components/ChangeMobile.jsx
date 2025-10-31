import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangeMobile.css';


function ChangeMobile() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();

  const handleChangeMobile = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/change-mobile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Mobile number updated successfully');

        // ✅ Update localStorage so Dashboard shows new number
        const storedUser =
          JSON.parse(localStorage.getItem('user')) ||
          JSON.parse(localStorage.getItem('googleUserInfo'));

        if (storedUser && storedUser.email === email) {
          storedUser.mobile = mobile;

          if (storedUser.isGoogleUser) {
            localStorage.setItem('googleUserInfo', JSON.stringify(storedUser));
          } else {
            localStorage.setItem('user', JSON.stringify(storedUser));
          }

          // ✅ Notify other tabs/pages (Dashboard listens to this)
          window.dispatchEvent(new Event('storage'));
        }

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

        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Enter New Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <button type="submit">Update Mobile</button>
        <p className="back-link" onClick={() => navigate('/dashboard')}>
          🔙 Back 
        </p>
      </form>
    </div>
  );
}

export default ChangeMobile;
