import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Dashboard.css";
import "./NLPResults.css";

function formatTableName(name) {
  return name
    .replace(/_fulltable$/i, "")   // remove _fulltable
    .replace(/_/g, " ")            // underscores → spaces
    .toUpperCase();                // optional: uppercase
}



/* ================= CHART SETUP ================= */

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
);

/* ================= MAIN PAGE ================= */

function NLPResults() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.result) {
    return (
      <div className="nlp-empty">
        <h2>No NLP result found</h2>
        <button onClick={() => navigate("/dashboard")}>Go Back</button>
      </div>
    );
  }

  const { question, result } = state;

  // ❌ Access denied
  if (result.success === false) {
    return (
      <div className="nlp-empty">
        <h2>Access Denied</h2>
        <p>{result.message}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // ⚠️ Empty result
  if (!result.results || Object.keys(result.results).length === 0) {
    return (
      <div className="nlp-empty">
        <h2>No Data Found</h2>
        <p>{"No results available"}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <>
      <p style={{ textAlign: "center", fontSize: "19px", marginTop: "15px" }}>
        <b>Question:</b> {question}
      </p>

      <div className="nlp-results-page">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <br /><br />

        {Object.entries(result.results).map(([table, rows]) => (
          <TableWithInsights key={table} table={table} rows={rows} />
        ))}
      </div>
    </>
  );
}


export default NLPResults;


function TableWithInsights({ table, rows }) {
  // console.log("TABLE NAME:", table);

  const [metric, setMetric] = useState("");

  if (!rows || rows.length === 0) {
    return (
      <div className="nlp-table-block">
        <h3>{formatTableName(table)}</h3>
        <p>No data found</p>
      </div>
    );
  }

  // Normalize numeric values
  const normalizedRows = rows.map((r) => {
    const obj = {};
    for (const k in r) {
      obj[k] = isNaN(r[k]) ? r[k] : Number(r[k]);
    }
    return obj;
  });

  const columns = Object.keys(normalizedRows[0]);

  // Detect numeric columns
  const numericColumns = columns.filter((c) =>
    normalizedRows.some((r) => typeof r[c] === "number")
  );

  // Detect label column
  const labelColumn =
    columns.find(
      (c) => typeof normalizedRows[0][c] === "string" && c !== "region"
    ) || columns[0];

 useEffect(() => {
  if (!metric && numericColumns.length > 0) {

    // Remove ID-like numeric columns
    const filtered = numericColumns.filter(
      (c) => !/id|code|no|index/i.test(c)
    );

    const candidates = filtered.length > 0 ? filtered : numericColumns;

    // Pick column with highest variance
    let best = candidates[0];
    let maxVariance = 0;

    candidates.forEach((col) => {
      const values = normalizedRows
        .map((r) => r[col])
        .filter((v) => typeof v === "number");

      if (values.length > 1) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance =
          values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
          values.length;

        if (variance > maxVariance) {
          maxVariance = variance;
          best = col;
        }
      }
    });

    setMetric(best);
  }
}, [numericColumns, metric, normalizedRows]);

  // Chart Config
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: labelColumn ? labelColumn.toUpperCase() : "X-AXIS",
          font: { weight: "bold" },
        },
        ticks: { display: false },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metric ? metric.toUpperCase() : "VALUE",
          font: { weight: "bold" },
        },
        grid: { color: "#e2e8f0" },
      },
    },
  };

  const insights = generateInsights(normalizedRows);

  const chartData = metric
    ? {
      labels: normalizedRows.map((r) => r[labelColumn]),
      datasets: [
        {
          label: metric,
          data: normalizedRows.map((r) => r[metric]),
          backgroundColor: "rgba(59,130,246,0.6)",
          borderColor: "rgba(59,130,246,1)",
          borderWidth: 2,
        },
      ],
    }
    : null;


  return (
    <div className="nlp-table-block">
     <h3>{formatTableName(table)}</h3>


      {/* INSIGHTS + PIE */}
      <div className="insights-box">
        <h4>Insights</h4>
        <ul>
          {insights.map((i, idx) => (
            <li key={idx}>
              <strong>{idx + 1}</strong> {i}
            </li>
          ))}
        </ul>
      </div>


      {/* METRIC SELECTOR */}
      {numericColumns.length > 1 && (
        <div className="metric-selector">
          <label>Metric:</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            {numericColumns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* CHART */}
      {chartData && (
        <>
          <div className="chart-wrapper">
            <h4>Chart Analysis</h4>
            <div className="chart-canvas-box">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

        </>
      )}

      {/* TABLE */}
      {renderTable(normalizedRows)}
    </div>
  );
}

/* ================= INSIGHTS ENGINE ================= */

function generateInsights(rows) {
  if (!rows || rows.length === 0) return [];

  const insights = [];
  const columns = Object.keys(rows[0]);

  insights.push(`Total records: ${rows.length}`);

  columns.forEach((col) => {
    const values = rows.map((r) => r[col]).filter(v => v != null);

    if (values.every(v => typeof v === "number")) {
      const sum = values.reduce((a, b) => a + b, 0);
      insights.push(`"${col}" → Total: ${sum}, Avg: ${(sum / values.length).toFixed(2)}`);
    }
  });

  return insights;
}

/* ================= TABLE RENDER ================= */

function renderTable(rows) {
  const columns = Object.keys(rows[0]);

  return (
    <div className="table-wrapper">
      <h4>Detailed Data</h4>
      <div className="table-scroll">
        <table className="tbl-full">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c}>{String(row[c] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
