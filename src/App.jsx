import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './components/firebase';

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
import ProcessedView from './components/ProcessedView';
import Navbar from './components/Navbar';
import SettingsPage from './components/SettingsPage';

import './app.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      const localUser = JSON.parse(localStorage.getItem('user'));
      const companyUser = JSON.parse(localStorage.getItem('company'));
      const token = localStorage.getItem('token');

      // Company login
      if (companyUser && token) {
        setUser({ ...companyUser, isCompany: true });
        setLoading(false);
        return;
      }

      // Google login
      if (firebaseUser) {
        const email = firebaseUser.email;
        try {
          const res = await fetch(`http://localhost:5000/user/${email}`);
          const data = await res.json();
          const latestUser =
            data.success && data.user
              ? { ...data.user, isGoogleUser: true }
              : {
                  firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
                  lastName: firebaseUser.displayName?.split(' ')[1] || '',
                  email,
                  mobile: '',
                  isGoogleUser: true,
                };
          setUser(latestUser);
          localStorage.setItem('googleUserInfo', JSON.stringify(latestUser));
        } catch (err) {
          console.error('Error fetching user:', err);
        }
        setLoading(false);
        return;
      }

      // Local user
      if (localUser && token) {
        setUser(localUser);
        setLoading(false);
        return;
      }

      // No user
      setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  // ✅ Protected route
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/l-gy5n8r4v2t" replace />;
  };

  // ✅ Public route
  const PublicRoute = ({ children, forCompany }) => {
    if (forCompany && user?.isCompany) return <Navigate to="/cf-2g7h9k3l5m" replace />;
    if (!forCompany && user && !user.isCompany) return <Navigate to="/d-oxwilh9dy1" replace />;
    return children;
  };

  return (
    <Router>
      {/* ✅ Navbar visible on all pages */}
      <Navbar user={user} setUser={setUser} />

      <div className="App" style={{ textAlign: 'center', marginTop: '80px' }}>
        <Routes>
          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={user ? '/d-oxwilh9dy1' : '/l-gy5n8r4v2t'} replace />}
          />

          {/* ===== Public Routes ===== */}
          <Route
            path="/l-gy5n8r4v2t"
            element={
              <PublicRoute forCompany={false}>
                <Login setIsLoggedIn={() => {}} setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/r-ya7w1p9s35"
            element={
              <PublicRoute forCompany={false}>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/cl-zv9ng4q6b8"
            element={
              <PublicRoute forCompany={true}>
                <CompanyLogin setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/cr-h2k8j5d1f5"
            element={
              <PublicRoute forCompany={true}>
                <CompanyRegister />
              </PublicRoute>
            }
          />

          {/* ===== Protected Routes ===== */}
          <Route
            path="/d-oxwilh9dy1"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/f-vxt2x3s7a1"
            element={
              <ProtectedRoute>
                <FileList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/u-p2q8k4r9jw"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cf-2g7h9k3l5m"
            element={
              <ProtectedRoute>
                <CompanyFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p-h7t4k9m3zq"
            element={
              <ProtectedRoute>
                <ProcessedView token={localStorage.getItem('token')} />
              </ProtectedRoute>
            }
          />

          {/* ✅ Settings Page - Protected */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Other single pages (still accessible separately if needed) */}
          <Route path="/fp-m3r7pdf0a9" element={<ForgotPassword />} />
          <Route path="/cp-sq4z6x8c27" element={<ChangePassword />} />
          <Route path="/cn-b5t1vs3l7g" element={<ChangeName />} />
          <Route path="/cm-x0j9w2a4bf" element={<ChangeMobile />} />

          {/* Catch-all redirect */}
          <Route
            path="*"
            element={<Navigate to={user ? '/d-oxwilh9dy1' : '/l-gy5n8r4v2t'} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
