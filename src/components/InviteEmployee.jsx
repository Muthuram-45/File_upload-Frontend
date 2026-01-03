import { useState } from "react";
import axios from "axios";
import "./InviteEmployeeModal.css";

function InviteEmployeeModal({ onClose }) {
    const [email, setEmail] = useState("");
    const [accessType, setAccessType] = useState("view");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loggedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("company"));

    const companyDomain = loggedUser?.email?.split("@")[1];

    const sendInvite = async () => {
        setError("");

        if (!email) {
            setError("Email is required");
            return;
        }

        if (!email.endsWith(`@${companyDomain}`)) {
            setError(`Only @${companyDomain} emails allowed`);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/invite-employee",
                { email, accessType },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onClose();
            alert("✅ Invitation sent successfully");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send invite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="invite-overlay">
            <div className="invite-modal">
                <h2>Invite to Join</h2>
                &nbsp;
                <p className="subtitle">
                    Invite employees from <b>@{companyDomain}</b>
                </p>

                <h4>Email Address</h4> 
           
                <input
                    type="email"
                    placeholder={`@${companyDomain}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                &nbsp;
                

                <h4>Access Type</h4>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            checked={accessType === "view"}
                            onChange={() => setAccessType("view")}
                        />
                        View Only
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={accessType === "login"}
                            onChange={() => setAccessType("login")}
                        />
                        Login Access
                    </label>
                </div>


                {error && <p className="error-msg">{error}</p>}

                <div className="btn-row">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        className="send-btn"
                        onClick={sendInvite}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Invite"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InviteEmployeeModal;