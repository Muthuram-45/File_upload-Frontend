import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './components/firebase'; // ✅ Import Firebase auth
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FileList from './components/FetchApi';
import Upload from './components/Upload';
import ForgotPassword from './components/ForgotPassword';
import ChangePassword from './components/ChangePassword';
import ChangeName from './components/ChangeName';
import ChangeMobile from './components/ChangeMobile';
import CompanyRegister from './components/CompanyRegister';
import CompanyLogin from './components/CompanyLogin';
import CompanyFiles from './components/CompanyFiles';
import './app.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check login for both Firebase & backend users
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      const companyUser = localStorage.getItem('company');
      setIsLoggedIn(!!token);
      setIsCompany(!!companyUser);
    };
    checkLogin();

    // ✅ Listen for login/logout changes
    window.addEventListener('storage', checkLogin);

    // ✅ Firebase Auth Listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        localStorage.setItem('token', user.accessToken || 'firebase-user');
        localStorage.setItem('user', JSON.stringify({ email: user.email }));
        setIsLoggedIn(true);
        setIsCompany(false);
      } else {
        const token = localStorage.getItem('token');
        if (!token) setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener('storage', checkLogin);
      unsubscribe();
    };
  }, []);

  // ✅ Prevent flicker while checking login
  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  // ✅ Protected Route
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to={isCompany ? '/company-login' : '/login'} replace />;
  };

  // ✅ Public Route
  const PublicRoute = ({ children }) => {
    if (isLoggedIn) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="App" style={{ textAlign: 'center' }}>
        <Routes>
          {/* Root Redirect */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />}
          />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login setIsLoggedIn={setIsLoggedIn} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Company Auth Routes */}
          <Route
            path="/company-login"
            element={
              <PublicRoute>
                <CompanyLogin setIsLoggedIn={setIsLoggedIn} />
              </PublicRoute>
            }
          />
          <Route
            path="/company-register"
            element={
              <PublicRoute>
                <CompanyRegister />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <FileList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route path="/company-files" element={<CompanyFiles />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/change-name" element={<ChangeName />} />
          <Route path="/change-mobile" element={<ChangeMobile />} />

          {/* Catch-all */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
