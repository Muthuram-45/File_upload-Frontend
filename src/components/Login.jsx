import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "./CompanyLogin.css";
import Footer from './Footer';

// ✅ ONLY ALLOWED PERSONAL EMAIL DOMAINS
const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
];

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const navigate = useNavigate();

  // 🔐 STRICT EMAIL CHECK
  const isAllowedEmail = (rawEmail) => {
    if (!rawEmail) return false;

    const email = rawEmail.trim().toLowerCase();
    if (!email.includes('@')) return false;

    const domain = email.split('@')[1];
    return ALLOWED_DOMAINS.includes(domain);
  };

  // =========================
  // HANDLE LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Swal.fire('Error', 'Please enter email and password', 'error');
      return;
    }

    // ❌ HARD BLOCK company.com, name@company.com, etc.
    if (!isAllowedEmail(cleanEmail)) {
      setEmailError(
        'Company email is not allowed here. Use personal email (gmail, yahoo, outlook).'
      );
      return; // ⛔ STOP HERE — NO API CALL
    }

    try {
      setLoading(true);

      const res = await axios.post('http://localhost:5000/login', {
        email: cleanEmail,
        password: cleanPassword,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);

      Swal.fire({
        title: 'Login Successful',
        text: `Welcome ${res.data.user.firstName || ''}`,
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });

      navigate('/d-oxwilh9dy1', { replace: true });

    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.error;

        if (msg === 'Account pending manager approval') {
          Swal.fire('⏳ Pending Approval', 'Waiting for manager approval.', 'info');
        } else if (msg === 'Account rejected') {
          Swal.fire('❌ Rejected', 'Your account was rejected.', 'error');
        } else {
          Swal.fire('Login Failed', msg || 'Invalid credentials', 'error');
        }
      } else {
        Swal.fire('Error', 'Server error. Try again later.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form-section">
          <div className="login-box">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Login to continue</p>

            <form onSubmit={handleLogin}>
              <div className="email-field">
                <input
                  type="email"
                  placeholder="Enter personal email"
                  className="login-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                />

                {emailError && (
                  <div className="input-tooltip">
                    ⚠️ {emailError}
                  </div>
                )}
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                className="login-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              className="company-login-btn"
              onClick={() => navigate('/cl-zv9ng4q6b8')}
            >
              Login as Company
            </button>

            <p className="footer-text">
              New user?{' '}
              <span onClick={() => navigate('/r-ya7w1p9s35')} className="register-link">
                Register here
              </span>
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}

export default Login;
