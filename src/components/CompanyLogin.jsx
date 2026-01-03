import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CompanyLogin.css';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/art3.png'; // ✅ Same image as normal login
import Footer from './Footer';

function CompanyLogin({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password || !companyName) {
      Swal.fire('Error', 'Please fill in all fields.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/company-login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        company_name: companyName.trim(),
      });

      if (res.data.success) {
        Swal.fire({
          title: '✅ Login Successful!',
          text: `Welcome, ${res.data.user.firstName || res.data.user.company_name}!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        const companyData = {
          company_name: res.data.user.company_name,
          email: res.data.user.email,
          mobile: res.data.user.mobile || '',
          firstName: res.data.user.firstName || '',
          lastName: res.data.user.lastName || '',
          isCompany: true,
        };

        // Store in localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('company', JSON.stringify(companyData));

        // Update App state
        setUser(companyData);

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/d-oxwilh9dy1', { replace: true });
        }, 100);
      } else {
        setMessage(res.data.error || 'Invalid credentials');
        Swal.fire('Error', res.data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Server error during login');
      Swal.fire('Error', 'Server error during login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="login-container">
      {/* Left Form Section */}
      <div className="login-form-section">
        <div className="login-box">
          <h2 className="login-title">Company Login </h2>
          <p className="login-subtitle">Access your company dashboard</p>

          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="login-input"
          />
          <input
            type="email"
            placeholder="Company Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <button onClick={handleLogin} className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Register Link */}
          <p className="footer-text">
            New company ?{' '}
            <span onClick={() => navigate('/cr-h2k8j5d1f5')} className="register-link">
              Register here
            </span>
          </p>

           <p className="footer-text">
            Normal User?{' '}
            <span onClick={() => navigate('/l-gy5n8r4v2t')} className="register-link">
              Login here
            </span>
          </p>

          {message && <p style={{ color: 'gray', marginTop: '10px' }}>{message}</p>}
        </div>
      </div>

      {/* Right Side Image Section */}
      <div className="login-image-section">
        <img src={loginImage} alt="Login Illustration" />
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default CompanyLogin;
