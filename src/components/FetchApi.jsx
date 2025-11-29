import React, { useState } from 'react';
import axios from 'axios';
import './FetchApi.css';
import Footer from './Footer';
import { useNavigate } from "react-router-dom";

function ApiFetcher() {
  const [apiUrl, setApiUrl] = useState('https://dummyjson.com/products?limit=50');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetch = async () => {
    if (!apiUrl.trim()) {
      setResponse('⚠️ Please enter a valid API URL.');
      return;
    }

    try {
      setLoading(true);
      setResponse('⏳ Fetching data...');
      const res = await axios.get(apiUrl);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse('❌ Failed to fetch data. Please check the API URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="api-fetcher">
      {/* ✅ Fixed Back Button (top-left corner) */}
      <button className="backk-btn" onClick={() => navigate('/d-oxwilh9dy1')}>
         Back
      </button>

      <h2>Simple API Fetcher</h2>

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

      <div className="response-box">
        <pre>{response}</pre>
      </div>
     
    </div>
     <Footer />
     </>
  );
}

export default ApiFetcher;
