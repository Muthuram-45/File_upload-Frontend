import React, { useState, useEffect } from 'react';
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
    const [message, setMessage] = useState({ type: '', text: '' });

    const plans = [
        { name: 'Trial', price: '0', days: '7 Days', color: '#fef9c3', border: '#fde68a', text: '#92400e', desc: 'Free evaluation period', features: ['NLP Queries', 'File Upload', 'API Fetch', 'Chat Bot', 'Daily Reports'] },
        { name: '1 Month', price: '29', days: '30 Days', color: '#ede9fe', border: '#c4b5fd', text: '#5b21b6', desc: 'Short-term access', features: ['NLP Queries', 'File Upload', 'API Fetch', 'Chat Bot', 'Daily Reports'] },
        { name: '1 Year', price: '249', days: '365 Days', color: '#fce7f3', border: '#f9a8d4', text: '#9d174d', desc: 'Ultimate value plan', features: ['Best Value (Save 40%)', 'All Features Unlocked', 'Dedicated Manager', 'Early Beta Access'] }
    ];

    const handleGetKey = async (plan) => {
        try {
            setActionLoading(true);
            setMessage({ type: '', text: '' });
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
        }
    };

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/subscription-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data);
        } catch (err) {
            console.error('Fetch status failed', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleActivate = async () => {
        if (!activationKey.trim()) {
            setMessage({ type: 'error', text: 'Please enter an activation key.' });
            return;
        }

        try {
            setActionLoading(true);
            setMessage({ type: '', text: '' });
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/activate-subscription`, 
                { key: activationKey },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: res.data.message });
            setActivationKey('');
            fetchStatus();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Activation failed' });
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

    if (loading) return <div className="sub-loader">Loading subscription data...</div>;

    const daysLeft = status?.isActive ? getDaysRemaining(status?.expiry) : 0;

    return (
        <div className="subscription-container">
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
                        {message.text && (
                            <div className={`message-banner-inline ${message.type}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name} 
                            className={`plan-card ${status?.plan === plan.name ? 'current' : ''}`}
                            style={{ 
                                '--plan-color': plan.color,
                                '--plan-border': plan.border,
                                '--plan-text': plan.text
                            }}
                        >
                            {status?.plan === plan.name && <div className="current-badge">Your Plan</div>}
                            <h3>{plan.name}</h3>
                            <div className="plan-price">
                                <span className="currency">$</span>
                                <span className="amount">{plan.price}</span>
                                {plan.price !== '0' && <span className="period">/term</span>}
                            </div>
                            <div className="plan-days">{plan.days}</div>
                            <p className="plan-desc">{plan.desc}</p>
                            <ul className="plan-features">
                                {plan.features.map(f => (
                                    <li key={f}><FaCheckCircle /> {f}</li>
                                ))}
                            </ul>
                            <div className="plan-footer">
                                <button className="learn-more-btn" onClick={() => handleGetKey(plan)} disabled={actionLoading}>
                                    {actionLoading ? 'Processing...' : 'Get Key'} <FaArrowRight />
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
