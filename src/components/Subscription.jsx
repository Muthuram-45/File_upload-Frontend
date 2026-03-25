import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Subscription.css';
import { FaCheckCircle, FaLock, FaCalendarAlt, FaKey, FaArrowRight, FaRegIdCard, FaHistory, FaHourglassHalf, FaGem } from 'react-icons/fa';
import Swal from 'sweetalert2';

const API_BASE = "http://localhost:4000";

const Subscription = () => {
    const [status, setStatus] = useState(null);
    const [activationKey, setActivationKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [requestingPlan, setRequestingPlan] = useState(null);
    const navigate = useNavigate();

    const plans = [
        { name: 'Trial', price: '0', days: '7 Days', color: '#fef9c3', border: '#fde68a', text: '#92400e', desc: 'Silver', features: ['NLP Queries', 'File Upload', 'API Fetch', 'Chat Bot', 'Daily Reports'] },
        { name: '1 Month', price: '29', days: '30 Days', color: '#ede9fe', border: '#c4b5fd', text: '#5b21b6', desc: 'Gold', features: ['NLP Queries', 'File Upload', 'API Fetch', 'Chat Bot', 'Daily Reports'] },
        { name: '1 Year', price: '249', days: '365 Days', color: '#fce7f3', border: '#f9a8d4', text: '#9d174d', desc: 'Platinum', features: ['Best Value (Save 40%)', 'All Features Unlocked', 'Dedicated Manager', 'Early Beta Access'] }
    ];

    const handleGetKey = async (plan) => {
        // 🔒 PERMISSION CHECK: Company employees cannot request keys
        if (status?.role === 'employee' && status?.company_name) {
            Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: "You do not have permission to access this. Please contact your manager.",
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        try {
            setActionLoading(true);
            setRequestingPlan(plan.name);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/subscription-request`, 
                { plan: plan.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: res.data.message || 'Request sent to admin successfully!',
                confirmButtonColor: '#2563eb',
                timer: 3000,
                timerProgressBar: true
            });

        } catch (err) {
            console.error('Subscription request failed', err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.error || 'Failed to send request',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setActionLoading(false);
            setRequestingPlan(null);
        }
    };

    const fetchStatus = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/subscription-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data);
        } catch (err) {
            console.error('Fetch status failed', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        
        // Poll for updates every 10 seconds to catch background syncs/activations
        const interval = setInterval(() => {
            fetchStatus(true);
        }, 10000);
        
        return () => clearInterval(interval);
    }, []);

    const handleActivate = async () => {
        // 🔒 PERMISSION CHECK: Company employees cannot activate keys
        if (status?.role === 'employee' && status?.company_name) {
            Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: "You do not have permission to access this. Please contact your manager.",
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        if (!activationKey.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Key',
                text: 'Please enter an activation key.',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/activate-subscription`, 
                { key: activationKey },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            Swal.fire({
                icon: 'success',
                title: 'Activated!',
                text: res.data.message || 'Subscription activated successfully!',
                confirmButtonColor: '#2563eb',
                timer: 3000,
                timerProgressBar: true
            });

            setActivationKey('');
            fetchStatus();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Activation Failed',
                text: err.response?.data?.error || 'Failed to activate subscription',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (expiry) => {
        if (!expiry) return 0;
        const diff = new Date(expiry) - new Date();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };


    const daysLeft = status?.isActive ? getDaysRemaining(status?.expiry) : 0;

    return (
        <div className="subscription-container">
            <button className="backk-btn" onClick={() => navigate("/d-oxwilh9dy1")}>
                Back
            </button>
            <div className="subscription-glass">
                <header className="sub-header">
                    <h1>Subscription Management</h1>
                    <p>Unlock the full power of Cloud360 with a premium plan.</p>
                </header>

                <div className="current-status-banner">
                    <div className="status-info">
                        <div className="plan-detail">
                            <span className="label"><FaRegIdCard /> Plan</span>
                            <span className="value">{status?.isActive ? (status?.plan || 'None') : 'None'}</span>
                        </div>
                        <div className="plan-detail">
                            <span className="label"><FaHistory /> Expiry</span>
                            <span className="value">{status?.isActive ? formatDate(status?.expiry) : 'N/A'}</span>
                        </div>
                        <div className="plan-detail">
                            <span className="label"><FaHourglassHalf /> Time Left</span>
                            <span className="value">{daysLeft} Days</span>
                        </div>
                    </div>

                    <div className="activation-inline">
                        <div className="activation-input-group">
                            <FaKey className="key-icon" />
                            <input 
                                type="text" 
                                placeholder="Activation Key" 
                                value={activationKey}
                                onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                            />
                            <button onClick={handleActivate} disabled={actionLoading}>
                                {actionLoading ? '...' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>

              <div className="plans-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`plan-card plan-${plan.name.toLowerCase().replace(/ /g, '-')} ${status?.plan === plan.name ? 'current' : ''}`}
                        >
                            {status?.plan === plan.name && <div className="current-badge">Your Plan</div>}
                            <div className="plan-header-top">
                                <h3>{plan.name}</h3>
                                <span className="plan-desc">{plan.desc}</span>
                            </div>
                            <div className="plan-price">
                                <span className="currency">$</span>
                                <span className="amount">{plan.price}</span>
                                {plan.price !== '0' && <span className="period">/term</span>}
                            </div>
                            <div className="plan-days">{plan.days}</div>
                            <ul className="plan-features">
                                {plan.features.map(f => (
                                    <li key={f}><FaCheckCircle /> {f}</li>
                                ))}
                            </ul>
                            <div className="plan-footer">
                                <button
                                    className="learn-more-btn"
                                    onClick={() => handleGetKey(plan)}
                                    disabled={!!requestingPlan}
                                >
                                    {requestingPlan === plan.name ? 'Processing...' : 'Get Key'} <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscription;
