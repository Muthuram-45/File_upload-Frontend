import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangeName.css';

function ChangeName() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginType, setLoginType] = useState('');
  const navigate = useNavigate();

  // ✅ Auto-fill user's info from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const googleUser = JSON.parse(localStorage.getItem('googleUserInfo'));
    const companyUser = JSON.parse(localStorage.getItem('company'));

    let activeUser = null;
    let type = '';

    if (companyUser) {
      activeUser = companyUser;
      type = 'company';
    } else if (user) {
      activeUser = user;
      type = 'user';
    } else if (googleUser) {
      activeUser = googleUser;
      type = 'google';
    }

    if (activeUser) {
      setEmail(activeUser.email || '');
      setFirstName(activeUser.firstName || '');
      setLastName(activeUser.lastName || '');
      setLoginType(type);
    }
  }, []);

  const handleChangeName = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/change-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Name updated successfully!');

        // ✅ Update correct localStorage based on login type
        let storageKey = '';
        if (loginType === 'google') storageKey = 'googleUserInfo';
        else if (loginType === 'company') storageKey = 'company';
        else storageKey = 'user';

        const updatedUser = {
          ...(JSON.parse(localStorage.getItem(storageKey)) || {}),
          firstName,
          lastName,
        };

        localStorage.setItem(storageKey, JSON.stringify(updatedUser));

        // Notify other pages that localStorage was updated
        window.dispatchEvent(new Event('storage'));

        // Redirect back to settings or dashboard
        navigate('/d-oxwilh9dy1'); // ✅ same dashboard route as in SettingsPage
      } else {
        alert('❌ ' + (data.error || 'Update failed'));
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Something went wrong. Please try again.');
    }
  };

  return (
    <div className="change-name-container">
      <form className="change-name-form" onSubmit={handleChangeName}>
        <h2>Change Name</h2>

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          readOnly
          required
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
      </form>
    </div>
  );
}

export default ChangeName;
