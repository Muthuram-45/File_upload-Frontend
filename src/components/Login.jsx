import React, { useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginImage from '../assets/art3.png';  // ✅ Local image import

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both Gmail and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (setIsLoggedIn) setIsLoggedIn(true);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    } catch (err) {
      console.error('❌ Login error:', err);
      alert(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* ✅ Left Form Section */}
      <div className="login-form-section">
        <div className="login-box">
          <h2 className="login-title">Welcome Back 👋</h2>
          <p className="login-subtitle">Login to continue</p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter your Gmail"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="footer-text">
            New user?{' '}
            <span onClick={() => navigate('/register')} className="register-link">
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* ✅ Right Side Image Section */}
      <div className="login-image-section">
        <img src={loginImage} alt="Login Illustration" />
      </div>
    </div>
  );
}

export default Login;
