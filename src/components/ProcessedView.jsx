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

  // =============================
  // 🔐 SAFETY: Redirect on refresh
  // =============================
  useEffect(() => {
    if (!folder || !token) {
      navigate(-1);
    }
  }, [folder, token, navigate]);

  // =============================
  // 📦 FETCH PROCESSED TABLES
  // =============================
  useEffect(() => {
    if (!folder?.tables || !token) return;

    const fetchTables = async () => {
      try {
        const requests = folder.tables.map((tableName) =>
          axios
            .get(`http://localhost:5000/processed-table/${tableName}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((res) => ({
              tableName,
              rows: res.data.rows || [],
              status: res.data.status || "READY",
            }))
        );

        const result = await Promise.all(requests);
        setTables(result);
        setError("");
      } catch (err) {
        console.error("API ERROR:", err.response?.data);
        setError(err.response?.data?.error || "Failed to load table data");
      }
    };

    fetchTables();
  }, [folder, token]);

  // =============================
  // 🧠 TABLE SELECTION
  // =============================
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

  // =============================
  // 📊 TABLE RENDER
  // =============================
  const renderTable = (table) => {
    if (!table) {
      return <p className="empty-msg">No table selected</p>;
    }

    if (table.status === "WAITING") {
      return <p className="empty-msg">⏳ Processing in progress...</p>;
    }

    if (table.rows.length === 0) {
      return <p className="empty-msg">No data available</p>;
    }

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

  // =============================
  // 🧩 UI
  // =============================
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
      </div>

      {/* CONTENT */}
      <div className="csv-table-section">
        {renderTable(activeTable)}
      </div>
    </div>
  );
}

export default ProcessedView;
