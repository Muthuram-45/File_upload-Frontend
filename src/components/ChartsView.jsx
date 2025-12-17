import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./ProcessedView.css";

function ChartsView() {
  const { state } = useLocation();
  const { folder, token } = state || {};
  const navigate = useNavigate();

  const [activeFileData, setActiveFileData] = useState([]);
  const [error, setError] = useState("");

  const COLORS = [
    "#007bff",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
    "#845ec2",
    "#d65db1",
    "#ff6f91",
  ];

  // ======================== LOAD PROCESSED TABLE (NOT CSV) ========================
  useEffect(() => {
    if (!folder?.tables || !token) return;

    // Prefer full table for charts
    const preferredTable =
      folder.tables.find((t) => t.toLowerCase().endsWith("_fulltable")) ||
      folder.tables[0];

    axios
      .get(`http://localhost:5000/processed-table/${preferredTable}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setActiveFileData(Array.isArray(res.data.rows) ? res.data.rows : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load chart data");
      });
  }, [folder, token]);

  // ========================= RENDER CHART (UNCHANGED) =========================
  const renderChart = (chartData, catCol, numCol, color) => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={catCol} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey={numCol} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ========================= DETECT COLUMNS (UNCHANGED) =========================
  const detectColumns = (data) => {
    if (!data.length) return { numeric: [], categorical: [] };

    const keys = Object.keys(data[0]);
    const numeric = [];
    const categorical = [];

    keys.forEach((col) => {
      const lc = col.toLowerCase();

      if (
        lc.includes("id") ||
        lc.includes("date") ||
        lc.includes("email") ||
        lc.includes("name")
      )
        return;

      const values = data.map((r) => r[col]);

      const numVals = values.filter((v) => typeof v === "number");
      if (numVals.length > data.length * 0.5) numeric.push(col);

      const strVals = values.filter((v) => typeof v === "string");
      const unique = new Set(strVals).size;
      if (unique > 1 && unique <= 40) categorical.push(col);
    });

    return { numeric, categorical };
  };

  // ========================= DETECT AGGREGATION (UNCHANGED) =========================
  const detectAggregation = (values) => {
    if (!values || values.length === 0) return "count";

    const min = Math.min(...values);
    const max = Math.max(...values);
    const diff = max - min;

    if (max <= 120 || diff <= 10) return "count";
    if (diff / max < 0.2) return "avg";
    return "sum";
  };

  // ========================= AUTO MEANINGFUL CHARTS (UNCHANGED) =========================
  const renderMeaningfulCharts = (data) => {
    if (!data.length) return null;

    const { numeric, categorical } = detectColumns(data);
    const charts = [];

    categorical.forEach((catCol) => {
      numeric.forEach((numCol) => {
        if (charts.length >= 8) return;

        const grouped = {};

        data.forEach((row) => {
          const cat = row[catCol];
          const num = row[numCol];

          if (cat && !isNaN(num)) {
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(num);
          }
        });

        const chartData = Object.entries(grouped).map(([cat, arr]) => {
          const aggType = detectAggregation(arr);

          let value;
          if (aggType === "sum")
            value = arr.reduce((a, b) => a + b, 0);
          else if (aggType === "avg")
            value = arr.reduce((a, b) => a + b, 0) / arr.length;
          else value = arr.length;

          return { [catCol]: cat, [numCol]: value, aggType };
        });

        if (chartData.length < 2) return;

        charts.push(
          <div key={`${catCol}-${numCol}`} className="chart-card">
            <h4>
              {catCol} vs {numCol} ({chartData[0].aggType.toUpperCase()})
            </h4>

            {renderChart(
              chartData,
              catCol,
              numCol,
              COLORS[charts.length % COLORS.length]
            )}
          </div>
        );
      });
    });

    return charts;
  };

  return (
    <div className="processed-container">
      <h2>{folder?.folderName} - Charts</h2>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      {error && <p className="error-box">{error}</p>}

      {activeFileData.length > 0 ? (
        <div className="multi-chart-grid">
          {renderMeaningfulCharts(activeFileData)}
        </div>
      ) : (
        <p>No data found for charts</p>
            
          )
        }
        <p>No meaningful charts available for comparison.</p>
      
    </div>
  );
}

export default ChartsView;
