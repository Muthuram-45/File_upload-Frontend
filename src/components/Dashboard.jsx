import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import './Dashboard.css';
import logo from '../assets/logo.png'; // ✅ adjust the path to your actual logo file

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      const localUser = JSON.parse(localStorage.getItem('user'));
      const companyUser = JSON.parse(localStorage.getItem('company'));
      const token = localStorage.getItem('token');

      // ✅ Company Login
      if (companyUser && token) {
        setUser({
          ...companyUser,
          isCompany: true,
        });
        return;
      }

      // ✅ Google Login (updated part)
      if (firebaseUser) {
        const email = firebaseUser.email;

        try {
          // 🔹 Always fetch latest info from backend
          const res = await fetch(`http://localhost:5000/user/${email}`);
          const data = await res.json();

          if (data.success && data.user) {
            const latestUser = { ...data.user, isGoogleUser: true };
            setUser(latestUser);
            localStorage.setItem('googleUserInfo', JSON.stringify(latestUser));
          } else {
            // Fallback to Firebase info
            const firstName = firebaseUser.displayName?.split(' ')[0] || 'User';
            const lastName = firebaseUser.displayName?.split(' ')[1] || '';
            const googleUser = {
              firstName,
              lastName,
              email,
              mobile: '',
              isGoogleUser: true,
            };
            setUser(googleUser);
            localStorage.setItem('googleUserInfo', JSON.stringify(googleUser));
          }
        } catch (err) {
          console.error('Fetch latest Google user failed:', err);
          const firstName = firebaseUser.displayName?.split(' ')[0] || 'User';
          const lastName = firebaseUser.displayName?.split(' ')[1] || '';
          const googleUser = {
            firstName,
            lastName,
            email,
            mobile: '',
            isGoogleUser: true,
          };
          setUser(googleUser);
          localStorage.setItem('googleUserInfo', JSON.stringify(googleUser));
        }

        return;
      }

      // ✅ Normal User
      if (localUser && token) {
        setUser(localUser);
        return;
      }

      navigate('/login', { replace: true });
    });

    const handleStorageChange = () => {
      const updatedUser =
        JSON.parse(localStorage.getItem('user')) ||
        JSON.parse(localStorage.getItem('googleUserInfo')) ||
        JSON.parse(localStorage.getItem('company'));
      if (updatedUser) setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const companyUser = JSON.parse(localStorage.getItem('company'));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('googleUserInfo');
      localStorage.removeItem('company');
      sessionStorage.clear();
      setUser(null);

      auth.signOut().catch((err) => console.error('Firebase signOut error:', err));

      setTimeout(() => {
        if (companyUser) {
          window.location.href = '/company-login';
        } else {
          window.location.href = '/login';
        }
      }, 100);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="app-heading">
          <img src={logo} alt="Logo" className="logo" />
          <span>Cloud360</span>
        </div>

        <div
          className={`profile-area ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          ref={menuRef}
        >
          <div className="avatar-container">
            <div className="avatar-ring">
              <div className="profile-avatar">
                {user.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          <div className="profile-info">
            <span className="profile-name">{user.firstName || 'User'}</span>
            <span className="profile-role">
              {user.isCompany ? 'Company Account' : 'Account'}
            </span>
          </div>

          <div
            className={`dropdown-menu modern ${dropdownOpen ? 'show' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-header">
              <div className="profile-avatar large">
                {user.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-text">
                <h3>{user.firstName || 'User'} {user.lastName || ''}</h3>
                <p>{user.email}</p>
                {user.isCompany && <p>🏢 {user.company_name}</p>}
              </div>
            </div>

            <div className="profile-details-updated">
              <div className="profile-row">
                <div>
                  <strong>Name:</strong>{' '}
                  {user.firstName
                    ? `${user.firstName} ${user.lastName || ''}`
                    : user.company_name}
                </div>

                {!user.isCompany && (
                  <span
                    className="edit-icon"
                    onClick={() => navigate('/change-name')}
                    title="Edit Name"
                  >
                    ✏️
                  </span>
                )}
              </div>

              <div className="profile-row">
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
              </div>

              <div className="profile-row">
                <div>
                  <strong>Mobile:</strong>{' '}
                  {user.isCompany
                    ? user.mobile || user.phone || '— Not provided —'
                    : user.mobile || '— Not provided —'}
                </div>

                {!user.isCompany && (
                  <span
                    className="edit-icon"
                    onClick={() => navigate('/change-mobile')}
                    title="Edit Mobile"
                  >
                    ✏️
                  </span>
                )}
              </div>

              {!user.isCompany && (
                <>
                  <div className="profile-row">
                    <div>
                      <strong>Password:</strong> ••••••••
                    </div>
                    <span
                      className="edit-icon"
                      onClick={() => navigate('/change-password')}
                      title="Change Password"
                    >
                      🔐
                    </span>
                  </div>

                  <button
                    className="forgot-password-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/forgot-password');
                    }}
                  >
                    Forgot Password
                  </button>
                </>
              )}
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-actions">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="content-box">
          <h2>
            Welcome, {user.isCompany ? user.company_name : user.firstName || 'User'} 👋
          </h2>

          {user.isCompany ? (
            <p>Manage your company’s files and users efficiently.</p>
          ) : (
            <p>Manage your files efficiently — upload and process them easily.</p>
          )}

          <div className="dashboard-actions">
            <button
              className="dashboard-btn upload"
              onClick={() => navigate('/upload')}
            >
              ⬆️ Upload File
            </button>

            <button
              className="dashboard-btn view"
              onClick={() => navigate('/files')}
            >
              {user.isCompany ? 'API' : 'API'}
            </button>

            <button
              className="dashboard-btn view"
              onClick={() => navigate('/company-files')}
            >
              📁 View Files
            </button>
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>© 2025 My File Portal — All Rights Reserved.</p>
        <div className="footer-links">
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms & Conditions
          </a>
          <span>|</span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="/disclosures" target="_blank" rel="noopener noreferrer">
            Disclosures
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
