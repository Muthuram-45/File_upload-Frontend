import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangeName.css';


function ChangeName() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  // ✅ Auto-fill user's email and current name from localStorage
  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem('user')) ||
      JSON.parse(localStorage.getItem('googleUserInfo'));

    if (storedUser) {
      setEmail(storedUser.email || '');
      setFirstName(storedUser.firstName || '');
      setLastName(storedUser.lastName || '');
    }
  }, []);

  const handleChangeName = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://file-upload-backend-9.onrender.com/change-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Name updated successfully');

        // ✅ Update localStorage so Dashboard reflects changes instantly
        const storedUser =
          JSON.parse(localStorage.getItem('user')) ||
          JSON.parse(localStorage.getItem('googleUserInfo'));

        if (storedUser && storedUser.email === email) {
          storedUser.firstName = firstName;
          storedUser.lastName = lastName;

          if (storedUser.isGoogleUser) {
            localStorage.setItem('googleUserInfo', JSON.stringify(storedUser));
          } else {
            localStorage.setItem('user', JSON.stringify(storedUser));
          }

          // ✅ Notify Dashboard of update
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
    <div className="change-name-container">
      <form className="change-name-form" onSubmit={handleChangeName}>
        <h2>Change Name</h2>

        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          readOnly
        />

        <input
          type="text"
          placeholder="New First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="New Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <button type="submit">Update Name</button>
        <p className="back-link" onClick={() => navigate('/dashboard')}>
          🔙 Back 
        </p>
      </form>
    </div>
  );
}

export default ChangeName;
