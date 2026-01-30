import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  const [viewMode, setViewMode] = useState("bivariate");
 
  const chartTypesBivariate = ["bar", "line", "pie"];
 
  const COLORS = [
    "#007bff",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
    "#845ec2",
    "#d65db1",
    "#ff6f91",
  ];
 
  // ✅ Helper: numeric string -> number convert
  const normalizeRows = (rows) => {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      const out = { ...row };
      Object.keys(out).forEach((k) => {
        const v = out[k];
        if (typeof v === "string") {
          const t = v.trim();
          if (t !== "" && !isNaN(t)) out[k] = Number(t);
        }
      });
      return out;
    });
  };
 
  // ✅ Helper: limit top N categories (by Y value)
  const limitTopCategories = (chartData, yKey, topN = 12) => {
    const sorted = [...chartData].sort(
      (a, b) => (b?.[yKey] ?? 0) - (a?.[yKey] ?? 0)
    );
    return sorted.slice(0, topN);
  };
 
  // ======================== LOAD PROCESSED TABLE ========================
  useEffect(() => {
    if (!folder?.tables || !token) return;
 
    const preferredTable =
      folder.tables.find((t) => t.toLowerCase().endsWith("_fulltable")) ||
      folder.tables[0];
 
    axios
      .get(`http://localhost:5000/processed-table/${preferredTable}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const rows = Array.isArray(res.data.rows) ? res.data.rows : [];
        setActiveFileData(normalizeRows(rows));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load chart data");
      });
  }, [folder, token]);
 
  // ========================= RENDER CHART (PIE RULE) =========================
  const renderChart = (chartData, catCol, numCol, color, chartType) => {
    if (!chartData || chartData.length === 0) return null;
 
    const showPie = chartData.length <= 6; // ✅ <=6 pie, >6 bar fallback
 
    return (
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          {/* LINE */}
          {chartType === "line" && (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={catCol} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={numCol}
                stroke={color}
                strokeWidth={2}
              />
            </LineChart>
          )}
 
          {/* BAR */}
          {chartType === "bar" && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={catCol} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={numCol} fill={color} />
            </BarChart>
          )}
 
          {/* PIE (only if <= 6) */}
          {chartType === "pie" && showPie && (
            <PieChart>
              <Legend />
              <Tooltip />
              <Pie
                data={chartData}
                dataKey={numCol}
                nameKey={catCol}
                outerRadius={100}
                label={({ payload, value, percent }) =>
                  `${payload?.[catCol]}: ${value} (${(percent * 100).toFixed(
                    1
                  )}%)`
                }
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
 
          {/* PIE fallback -> BAR (if > 6) */}
          {chartType === "pie" && !showPie && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={catCol} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={numCol} fill={color} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };
 
  // ========================= DETECT COLUMNS (UPDATED FOR IPL) =========================
  const detectColumns = (data) => {
    if (!data.length) return { numeric: [], categorical: [] };
 
    const keys = Object.keys(data[0]);
    const numeric = [];
    const categorical = [];
 
    keys.forEach((col) => {
      const lc = col.toLowerCase();
 
      if (lc.includes("id") || lc.includes("email")) return;
      if (lc.includes("date") || lc.includes("timestamp")) return;
 
      const values = data.map((r) => r[col]);
 
      const numVals = values.filter(
        (v) => typeof v === "number" && !Number.isNaN(v)
      );
      if (numVals.length > data.length * 0.5) numeric.push(col);
 
      const strVals = values
        .map((v) => (v === undefined || v === null ? "" : String(v)))
        .filter((v) => v.trim() !== "");
 
      const unique = new Set(strVals).size;
      if (unique > 1 && unique <= 200) categorical.push(col);
    });
 
    return { numeric, categorical };
  };
 
  // ========================= UNIVARIATE =========================
  const renderUnivariateCharts = (data) => {
    if (!data.length) return null;
    const { numeric, categorical } = detectColumns(data);
    const charts = [];
 
    // numeric -> histogram
    numeric.forEach((numCol, i) => {
      const values = data
        .map((r) => r[numCol])
        .filter((v) => typeof v === "number" && !Number.isNaN(v));
      if (!values.length) return;
 
      const binCount = 10;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binSize = (max - min) / binCount || 1;
 
      const bins = Array.from({ length: binCount }, (_, idx) => ({
        range: `${Math.round(min + idx * binSize)} - ${Math.round(
          min + (idx + 1) * binSize
        )}`,
        count: 0,
      }));
 
      values.forEach((v) => {
        const index = Math.min(
          Math.floor((v - min) / binSize),
          binCount - 1
        );
        bins[index].count++;
      });
 
      charts.push(
        <div key={`hist-${numCol}`} className="chart-card">
          <h4>Histogram of {numCol}</h4>
          {renderChart(
            bins,
            "range",
            "count",
            COLORS[i % COLORS.length],
            "bar"
          )}
        </div>
      );
    });
 
    // categorical -> count (rotate bar/line/pie)
    categorical.forEach((catCol, i) => {
      const map = {};
      data.forEach((r) => {
        const v = r[catCol];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          map[v] = (map[v] || 0) + 1;
        }
      });
 
      const catData = Object.entries(map).map(([key, count]) => ({
        [catCol]: key,
        count,
      }));
 
      if (catData.length < 2) return;
 
      const limited = limitTopCategories(catData, "count", 12);
 
      const chartType =
        chartTypesBivariate[charts.length % chartTypesBivariate.length];
 
      charts.push(
        <div key={`uni-${catCol}-${chartType}`} className="chart-card">
          <h4>Count of {catCol}</h4>
          {renderChart(
            limited,
            catCol,
            "count",
            COLORS[(i + numeric.length) % COLORS.length],
            chartType
          )}
        </div>
      );
    });
 
    return charts;
  };
 
  // ========================= BIVARIATE (SUM ONLY + PIE preference when <=6) =========================
  const renderMeaningfulCharts = (data) => {
    if (!data.length) return null;
 
    const { numeric, categorical } = detectColumns(data);
    const charts = [];
    const usedPairs = new Set();
 
    categorical.forEach((catCol) => {
      numeric.forEach((numCol) => {
        if (charts.length >= 8) return;
 
        // ✅ SUM directly (no avg, no count)
        const groupedSum = {};
 
        data.forEach((row) => {
          const cat = row[catCol];
          const num = row[numCol];
 
          if (
            cat !== undefined &&
            cat !== null &&
            typeof num === "number" &&
            !Number.isNaN(num)
          ) {
            const key = String(cat);
            groupedSum[key] = (groupedSum[key] || 0) + num;
          }
        });
 
        const entries = Object.entries(groupedSum);
        if (entries.length < 2) return;
 
        const chartData = entries.map(([cat, sum]) => ({
          [catCol]: cat,
          [numCol]: sum,
        }));
 
        if (chartData.length < 2) return;
 
        // top 12 by SUM
        const limited = limitTopCategories(chartData, numCol, 12);
        if (limited.length < 2) return;
 
        const pairKey = `${catCol}__${numCol}`;
        if (usedPairs.has(pairKey)) return;
        usedPairs.add(pairKey);
 
        // ✅ ensure pie chance: if <=6 categories, force pie
        const chartType =
          limited.length <= 6
            ? "pie"
            : charts.length % 2 === 0
            ? "bar"
            : "line";
 
        charts.push(
          <div key={`${pairKey}-${chartType}`} className="chart-card">
            <h4>SUM of {numCol} by {catCol}</h4>
 
            {renderChart(
              limited,
              catCol,
              numCol,
              COLORS[charts.length % COLORS.length],
              chartType
            )}
          </div>
        );
      });
    });
 
    if (charts.length === 0) {
      return (
        <p style={{ padding: 12, opacity: 0.8 }}>
          No meaningful bivariate charts found.
        </p>
      );
    }
 
    return charts;
  };
 
  return (
    <div className="processed-container">
      <h2>{folder?.folderName} - Charts</h2>
 
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
 
      <div className="chart-toggle">
        <button
          className={viewMode === "univariate" ? "active" : ""}
          onClick={() => setViewMode("univariate")}
        >
          Univariate
        </button>
 
        <button
          className={viewMode === "bivariate" ? "active" : ""}
          onClick={() => setViewMode("bivariate")}
        >
          Bivariate
        </button>
      </div>
 
      {error && <p className="error-box">{error}</p>}
 
      {activeFileData.length > 0 ? (
        <div className="multi-chart-grid">
          {viewMode === "univariate"
            ? renderUnivariateCharts(activeFileData)
            : renderMeaningfulCharts(activeFileData)}
        </div>
      ) : (
        <p>No data found for charts</p>
      )}
    </div>
  );
}
 
export default ChartsView;