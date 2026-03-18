import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTicketAlt, FaInfoCircle, FaRegClock, FaCheckCircle, FaExclamationTriangle, FaPaperPlane } from "react-icons/fa";
import "./Support.css";

const API_BASE = "http://localhost:4000";

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        category: "General Inquiry",
        priority: "Medium",
        message: ""
    });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/client-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.message.trim()) {
            return Swal.fire("Error", "Please fill in all required fields", "error");
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE}/api/client-tickets`, {
                subject: formData.subject,
                issue: formData.message,
                category: formData.category,
                priority: formData.priority
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire("Success", "Your ticket has been submitted successfully.", "success");
            setFormData({
                subject: "",
                category: "General Inquiry",
                priority: "Medium",
                message: ""
            });
            fetchTickets();
        } catch (err) {
            console.error("Failed to submit ticket", err);
            Swal.fire("Error", "Failed to submit ticket. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const openTicketDetails = (ticket) => {
        setSelectedTicket(ticket);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'open') return <span className="status-badge open">OPEN</span>;
        if (s === 'inprogress') return <span className="status-badge progress">IN PROGRESS</span>;
        if (s === 'review') return <span className="status-badge review">UNDER REVIEW</span>;
        if (s === 'complete') return <span className="status-badge resolved">COMPLETE</span>;
        return <span className="status-badge">{status}</span>;
    };

    const getPriorityIcon = (priority) => {
        const p = priority?.toLowerCase();
        if (p === 'high') return <FaExclamationTriangle className="prio-icon high" title="High Priority" />;
        if (p === 'low') return <FaInfoCircle className="prio-icon low" title="Low Priority" />;
        return <FaRegClock className="prio-icon medium" title="Medium Priority" />;
    };

    return (
        <div className="support-container">
            <div className="support-header">
                <h1><FaTicketAlt /> Support Center</h1>
                <p>Submit your queries and we'll get back to you via email</p>
            </div>

            <div className="support-layout">
                {/* Submit Ticket Section */}
                <div className="support-form-card">
                    <h2><FaPaperPlane /> Submit New Ticket</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief summary of the issue"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    <option>General Inquiry</option>
                                    <option>Technical Issue</option>
                                    <option>Billing</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleInputChange}>
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Message *</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Describe your issue in detail"
                                rows="5"
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-ticket-btn" disabled={submitting}>
                            {submitting ? "Submitting..." : <><FaPaperPlane /> Submit Ticket</>}
                        </button>
                    </form>
                </div>

                {/* Info & Tickets List Section */}
                <div className="support-sidebar">
                    <div className="contact-info-card">
                        <h3>Contact Information</h3>
                        <div className="info-item">
                            <strong>Email:</strong> <span>cloud360@gmail.com</span>
                        </div>
                        <div className="info-item">
                            <strong>Phone:</strong> <span>+91 90800-30487</span>
                        </div>
                        <div className="info-item">
                            <strong>Hours:</strong> <span>MON-SAT, 9-6 IST</span>
                        </div>
                    </div>

                    <div className="my-tickets-card">
                        <h3><FaCheckCircle /> My Tickets</h3>
                        <div className="tickets-list">
                            {loading ? (
                                <p className="loading-text">Loading tickets...</p>
                            ) : tickets.length === 0 ? (
                                <p className="empty-text">No tickets found.</p>
                            ) : (
                                <table className="tickets-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>SUBJECT</th>
                                            <th>DATE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map((t, index) => (
                                            <tr key={t.id} onClick={() => openTicketDetails(t)}>
                                                <td>{getPriorityIcon(t.priority)} {tickets.length - index}</td>
                                                <td className="ticket-subject-cell">{t.subject}</td>
                                                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Details Modal */}
            {showModal && selectedTicket && (
                <div className="support-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="support-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ticket #{selectedTicket.id}</h2>
                            {getStatusBadge(selectedTicket.status)}
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <label>SUBJECT</label>
                                <p>{selectedTicket.subject}</p>
                            </div>

                            <div className="detail-section">
                                <label>DESCRIPTION</label>
                                <p className="issue-text">{selectedTicket.issue}</p>
                            </div>

                            {selectedTicket.admin_response && (
                                <div className="detail-section response-section">
                                    <label>LATEST STATUS UPDATE</label>
                                    <div className="response-box">
                                        {selectedTicket.admin_response}
                                    </div>
                                </div>
                            )}

                            <div className="detail-row">
                                <div className="detail-section">
                                    <label>PRIORITY</label>
                                    <p>{getPriorityIcon(selectedTicket.priority)} {selectedTicket.priority.toUpperCase()}</p>
                                </div>
                                <div className="detail-section text-right">
                                    <label>DATE SUBMITTED</label>
                                    <p>{new Date(selectedTicket.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="close-modal-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
