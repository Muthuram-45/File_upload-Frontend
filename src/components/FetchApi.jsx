import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchApi.css";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../apiConfig";

function ApiFetcher() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const [responseObj, setResponseObj] = useState(null); // ✅ OBJECT (NOT STRING)
  const [responseText, setResponseText] = useState(""); // for UI only
  const [hasFetched, setHasFetched] = useState(false);

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [popup, setPopup] = useState({
    type: "success",
  });
  const [showTypeModal, setShowTypeModal] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = BASE_API_URL;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ===============================
  // 🔐 ACCESS GUARD
  // ===============================
  useEffect(() => {
    if (!token || !user) {
      showPopup("🔐 Please login first", "error");
      setTimeout(() => navigate("/l-gy5n8r4v2t"), 1500);
      return;
    }

    if (user.viewOnly) {
      showPopup("🚫 View-only access not allowed", "error");
      setTimeout(() => navigate("/l-gy5n8r4v2t"), 2000);
      return;
    }

    if (user.pendingLogin || token === "PENDING_LOGIN") {
      showPopup("🔐 Complete company registration first", "error");
      setTimeout(() => navigate("/cr-h2k8j5d1f5"), 2000);
    }
  }, []);

  // ===============================
  // POPUP
  // ===============================
  const showPopup = (message, type = "success", duration = 3000) => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type }), duration);
  };

  // ===============================
  // STEP 1️⃣ FETCH API
  // ===============================
  const handleFetch = async () => {
    if (!apiUrl.trim()) {
      return showPopup("⚠️ Enter API URL", "error");
    }

    try {
      setLoading(true);
      setHasFetched(false);
      setResponseObj(null);
      setResponseText("");

      const res = await axios.get(`${API_BASE_URL}/fetch-api`, {
        params: { url: apiUrl },
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
          ...(apiToken && { "authorization-external": apiToken }),
        },
      });

      setResponseObj(res.data.data); // ✅ STORE OBJECT
      setResponseText(JSON.stringify(res.data.data, null, 2)); // UI
      setHasFetched(true);
      setShowToken(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setShowToken(true);
        showPopup("🔐 Private API detected. Enter API token.", "error");
      } else if (err.response?.data?.subscriptionExpired) {
        showPopup("💳 Subscription Expired. Please activate a plan.", "error");
        setTimeout(() => navigate("/subscription"), 2500);
      } else {
        showPopup("❌ Failed to fetch API", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // STEP 2️⃣ SAVE API
  // ===============================
  const handleSave = () => {
    if (!fileName.trim()) {
      return showPopup("⚠️ Enter File Name", "error");
    }

    if (!responseObj) {
      return showPopup("⚠️ Fetch API before saving", "error");
    }

    setShowTypeModal(true);
  };

  const confirmSave = async (apiType, interval) => {
    try {
      setSaveLoading(true);
      setShowTypeModal(false);

      await axios.post(
        `${API_BASE_URL}/save-api-data`,
        {
          api_url: apiUrl,
          file_name: fileName,
          response: responseObj, // ✅ OBJECT ONLY
          api_type: apiType,
          api_interval: interval, // NEW
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(apiToken && { "authorization-external": apiToken }),
          },
        }
      );

      showPopup("✅ API saved successfully");
      setFileName("");
      setHasFetched(false);
    } catch (err) {
      if (err.response?.status === 409) {
        showPopup("❌ File name already exists", "error");
      } else if (err.response?.status === 401) {
        showPopup("🔐 Invalid API token", "error");
      } else if (err.response?.data?.subscriptionExpired) {
        showPopup("💳 Subscription Expired. Please activate a plan.", "error");
        setTimeout(() => navigate("/subscription"), 2500);
      } else {
        showPopup("❌ Save failed", "error");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <>
      <div className="api-fetcher">
        <button className="backk-btn" onClick={() => navigate("/d-oxwilh9dy1")}>
          Back
        </button>

        <h2>API Fetcher</h2>

        {/* FETCH */}
        <div className="api-row">
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="Enter API URL"
            className="api-input"
          />

          <button onClick={handleFetch} className="fetch-btn" disabled={loading}>
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>

        {showToken && (
          <input
            type="text"
            className="api-input"
            placeholder="Enter API Token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
        )}

        {/* RESPONSE */}
        <div className="response-box">
          <pre>{responseText || "🔎 API response will appear here..."}</pre>
        </div>

        {/* SAVE */}
        {hasFetched && (
          <div className="save-section">
            <input
              type="text"
              className="file-input"
              placeholder="Enter File Name (e.g. orders)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <button
              onClick={handleSave}
              className="save-btn"
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        {popup.show && (
          <div className={`popup ${popup.type}`}>{popup.message}</div>
        )}

        {/* 🔹 API TYPE SELECTION MODAL */}
        {showTypeModal && (
          <div className="type-modal-overlay">
            <div className="type-modal">
              <h3>Select Processing Frequency</h3>
              <p>How often should we fetch and process data from this API?</p>

              <div className="interval-section" style={{ marginTop: '20px', textAlign: 'left' }}>
                <h4 style={{ marginBottom: '10px' }}>📦 Batch Processing</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <button className="type-option-btn batch" onClick={() => confirmSave("Batch", "1d")} style={{ padding: '10px' }}>Every 1 Day</button>
                  <button className="type-option-btn batch" onClick={() => confirmSave("Batch", "7d")} style={{ padding: '10px' }}>Every 7 Days</button>
                  <button className="type-option-btn batch" onClick={() => confirmSave("Batch", "15d")} style={{ padding: '10px' }}>Every 15 Days</button>
                  <button className="type-option-btn batch" onClick={() => confirmSave("Batch", "30d")} style={{ padding: '10px' }}>Every 30 Days</button>
                </div>

                <h4 style={{ marginBottom: '10px' }}>⚡ Stream Processing</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="type-option-btn stream" onClick={() => confirmSave("Stream", "5m")} style={{ padding: '10px' }}>Every 5 Min</button>
                  <button className="type-option-btn stream" onClick={() => confirmSave("Stream", "10m")} style={{ padding: '10px' }}>Every 10 Min</button>
                  <button className="type-option-btn stream" onClick={() => confirmSave("Stream", "30m")} style={{ padding: '10px' }}>Every 30 Min</button>
                </div>
              </div>

              <button
                className="cancel-modal-btn"
                onClick={() => setShowTypeModal(false)}
                style={{ marginTop: '20px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default ApiFetcher;
