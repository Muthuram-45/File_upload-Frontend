import React, { useState } from 'react';
import axios from 'axios';
import './FetchApi.css';

function ApiFetcher() {
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="api-fetcher">
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
  );
}

export default ApiFetcher;
