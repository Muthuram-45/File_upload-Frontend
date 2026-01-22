import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProcessedView.css";
 
function ProcessedView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { folder, token } = state || {};
 
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState("full");
  const [error, setError] = useState("");
 
  // NLP states
  const [nlpQuery, setNlpQuery] = useState("");
  const [nlpResult, setNlpResult] = useState([]);
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    if (!folder?.tables || !token) return;
 
    const fetchTables = async () => {
    try {
      const requests = folder.tables.map((tableName) =>
        axios.get(`http://localhost:5000/processed-table/${tableName}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => ({
          tableName,
          rows: res.data.rows || [],
        }))
      );
 
      const result = await Promise.all(requests);
      setTables(result);
    } catch {
      setError("Failed to load table data");
    }
  };
 
    fetchTables();
  }, [folder, token]);
 
  const getTableByType = (type) =>
    tables.find((t) => t.tableName.toLowerCase().endsWith(type));
 
  const activeTable =
    activeTab === "full"
      ? getTableByType("_fulltable")
      : activeTab === "entity"
      ? getTableByType("_entity")
      : activeTab === "metrics"
      ? getTableByType("_metrics")
      : activeTab === "dimension"
      ? getTableByType("_dimension")
      : null;
 
  const handleNLP = async () => {
    if (!nlpQuery.trim()) return;
 
    try {
      setLoading(true);
      setNlpResult([]);
 
      const res = await axios.post(
        "http://localhost:5000/nlp/query",
        {
          question: nlpQuery,
          baseName: folder.folderName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
 
      setNlpResult(res.data.result || []);
    } catch {
      setError("Wrong .....");
    } finally {
      setLoading(false);
    }
  };
 
  const renderTable = (table) => {
    if (!table || table.rows.length === 0)
      return <p className="empty-msg">Please wait your datas are loading!...</p>;
 
    const columns = Object.keys(table.rows[0]);
 
    return (
      <div className="table-wrapper">
        <table className="tbl-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>{String(row[col] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
 
  return (
    <div className="processed-container">
      <h2>{folder?.folderName}</h2>
 
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
 
      {error && <div className="error-box">{error}</div>}
 
      {/* TABS */}
      <div className="file-tabs-container">
        <button
          className={`file-tab-btn ${activeTab === "full" ? "active" : ""}`}
          onClick={() => setActiveTab("full")}
        >
          Full Table
        </button>
 
        <button
          className={`file-tab-btn ${activeTab === "entity" ? "active" : ""}`}
          onClick={() => setActiveTab("entity")}
        >
          Entity Table
        </button>
 
        <button
          className={`file-tab-btn ${activeTab === "metrics" ? "active" : ""}`}
          onClick={() => setActiveTab("metrics")}
        >
          Metrics Table
        </button>
 
        <button
          className={`file-tab-btn ${activeTab === "dimension" ? "active" : ""}`}
          onClick={() => setActiveTab("dimension")}
        >
          Dimension Table
        </button>
 
        <button
          className={`file-tab-btn ${activeTab === "nlp" ? "active" : ""}`}
          onClick={() => setActiveTab("nlp")}
        >
          NLP Query
        </button>
      </div>
 
      {/* CONTENT */}
      <div className="csv-table-section">
        {activeTab !== "nlp" && renderTable(activeTable)}
 
        {activeTab === "nlp" && (
          <div className="nlp-panel-wrapper">
            <div className="nlp-panel">
              <h3>Ask me something related to this data</h3>
 
              <div className="nlq-search-box">
                <input
                  type="text"
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  placeholder="Type your question here..."
                />
                <button onClick={handleNLP} disabled={loading}>
                  {loading ? "Processing..." : "Send"}
                </button>
              </div>
 
              {nlpResult.length > 0 && (
                <div className="table-wrapper">
                  <table className="tbl-full">
                    <thead>
                      <tr>
                        {Object.keys(nlpResult[0]).map((k) => (
                          <th key={k}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {nlpResult.map((row, i) => (
                        <tr key={i}>
                          {Object.keys(row).map((k) => (
                            <td key={k}>{String(row[k] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 
export default ProcessedView;