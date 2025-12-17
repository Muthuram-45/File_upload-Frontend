import React, { useState } from 'react';
import axios from 'axios';
import './FetchApi.css';
import Footer from './Footer';
import { useNavigate } from "react-router-dom";

function ApiFetcher() {
  const [apiUrl, setApiUrl] = useState('https://random-data-api.com/api/medical/random_medical');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000"; // Your backend URL

  // Show popup function
  const showPopup = (message, type = 'success', duration = 3000) => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type }), duration);
  };

  const handleFetch = async () => {
  if (!apiUrl.trim()) {
    setResponse('');
    showPopup('⚠️ Please enter a valid API URL.', 'error');
    return;
  }

  try {
    setLoading(true);
    setResponse('⏳ Fetching data...');

    // Call your backend proxy route
    const res = await axios.get(`${API_BASE_URL}/fetch-api`, {
      params: { url: apiUrl }
    });

    setResponse(JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error(error);

    // This is the exact message you want
    setResponse('');
    showPopup('❌ Failed to fetch data. Please check the API URL.', 'error');
  } finally {
    setLoading(false);
  }
};


  // Save API data
  const handleSave = async () => {
    if (!fileName.trim()) {
      showPopup("⚠️ Please enter a file name!", 'error');
      return;
    }

    try {
      setSaveLoading(true);

      // Check duplicate filename
      const check = await axios.get(`${API_BASE_URL}/check-filename?name=${fileName}`);
      if (check.data.exists) {
        showPopup("❌ File name already exists. Choose a different name.", 'error');
        setSaveLoading(false);
        return;
      }

      // Save data
      await axios.post(`${API_BASE_URL}/save-api-data`, {
        api_url: apiUrl,
        file_name: fileName,
        response,
        company_name: "YourCompany"
      });

      showPopup("✔ API Data Saved Successfully!", 'success');
      setFileName("");
    } catch (err) {
      console.error(err);
      showPopup("❌ Failed to save data.", 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <div className="api-fetcher">

        <button className="backk-btn" onClick={() => navigate('/d-oxwilh9dy1')}>
          Back
        </button>

        <h2>Simple API Fetcher</h2>

        <div className="api-row">
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="Enter API URL"
            className="api-input"
          />
          <button onClick={handleFetch} className="fetch-btn" disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch'}
          </button>
        </div>

        <div className="response-box">
          <pre>{response}</pre>
        </div>

        {response && response.length > 0 && (
          <div className="save-section">
            <h3>Save API Data</h3>
            <div className="save-row">
              <input
                type="text"
                className="file-input"
                placeholder="Enter File Name "
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
          </div>
        )}

        {/* Popup */}
        {popup.show && (
          <div className={`popup ${popup.type}`}>
            {popup.message}
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}

export default ApiFetcher;
