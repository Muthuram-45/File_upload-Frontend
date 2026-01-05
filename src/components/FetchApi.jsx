import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchApi.css";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

function ApiFetcher() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:5000";

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ======================================================
  // 🔥 HARD ACCESS GUARD (VERY IMPORTANT)
  // ======================================================
  useEffect(() => {
    // ❌ NOT LOGGED IN
    if (!token || !user) {
      showPopup("🔐 Please login to use Fetch API.", "error");
      setTimeout(() => navigate("/l-gy5n8r4v2t"), 1500);
      return;
    }

    // 👀 VIEW ONLY
    if (user.viewOnly) {
      showPopup(
        "🚫 View-only access.\nPlease login to fetch API data.",
        "error"
      );
      setTimeout(() => navigate("/l-gy5n8r4v2t"), 2000);
      return;
    }

    // 🔐 INVITED BUT NOT REGISTERED
    if (user.pendingLogin || token === "PENDING_LOGIN") {
      showPopup(
        "🔐 Please complete company registration to use Fetch API.",
        "error"
      );
      setTimeout(() => navigate("/cr-h2k8j5d1f5"), 2000);
      return;
    }
  }, []);

  // =========================
  // POPUP
  // =========================
  const showPopup = (message, type = "success", duration = 3000) => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type }), duration);
  };

  // =========================
  // FETCH API
  // =========================
  const handleFetch = async () => {
    if (!apiUrl.trim()) {
      return showPopup("⚠️ Please enter API URL", "error");
    }

    try {
      setLoading(true);
      setResponse("");

      const res = await axios.get(`${API_BASE_URL}/fetch-api`, {
        params: { url: apiUrl },
        headers: {
          Authorization: `Bearer ${token}`,
          ...(apiToken && { "authorization-external": apiToken }),
        },
      });

      setShowToken(false);
      setResponse(JSON.stringify(res.data.data || res.data, null, 2));
    } catch (error) {
      if (error.response?.status === 401) {
        setShowToken(true);
        return showPopup("🔐 Private API detected. Enter API token.", "error");
      }
      showPopup("❌ Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAVE API DATA
  // =========================
  const handleSave = async () => {
    if (!fileName.trim()) {
      return showPopup("⚠️ Enter file name", "error");
    }

    try {
      setSaveLoading(true);

      const check = await axios.get(
        `${API_BASE_URL}/check-filename?name=${fileName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (check.data.exists) {
        return showPopup("❌ File name already exists", "error");
      }

      await axios.post(
        `${API_BASE_URL}/save-api-data`,
        {
          api_url: apiUrl,
          file_name: fileName,
          response,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showPopup("✅ API Data saved successfully");
      setFileName("");
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err);
      showPopup("❌ Save failed", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <>
      <div className="api-fetcher">
        <button className="backk-btn" onClick={() => navigate("/d-oxwilh9dy1")}>
          Back
        </button>

        <h2>API Fetcher</h2>

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

        <div className="response-box">
          <pre>{response || "🔎 API response will appear here..."}</pre>
        </div>

        {response && (
          <div className="save-section">
            <input
              type="text"
              className="file-input"
              placeholder="Enter File Name"
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
      </div>

      <Footer />
    </>
  );
}

export default ApiFetcher;
