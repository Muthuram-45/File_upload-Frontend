import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  LineElement,
  ScatterController,
  LinearScale as LinearScaleScatter,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Line, Scatter, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";
import "./NLPResults.css";
 
function formatTableName(name) {
  return name
    .replace(/_fulltable$/i, "")
    .replace(/_/g, " ")
    .toUpperCase();
}
 
/* ================= CHART SETUP ================= */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  LineElement,
  ScatterController,
  LinearScaleScatter,
  Tooltip,
  Legend,
);
 
/* ================= MAIN PAGE ================= */
function NLPResults() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tableRefs = useRef([]);
  const [isSending, setIsSending] = useState(false);
 
  if (!state || !state.result) {
    return (
      <div className="nlp-empty">
        <h2>No NLP result found</h2>
        <button onClick={() => navigate("/dashboard")}>Go Back</button>
      </div>
    );
  }
 
  const { question, result } = state;
 
  if (result.success === false) {
    return (
      <div className="nlp-empty">
        <h2>Access Denied</h2>
        <p>{result.message}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
 
  if (!result.results || Object.keys(result.results).length === 0) {
    return (
      <div className="nlp-empty">
        <h2>No Data Found</h2>
        <p>{result.message || "No data found for your question"}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
 
  /* ================= SEND PDF ================= */
  const sendPdf = async () => {
    try {
      setIsSending(true); // 👈 start loading
      const token = localStorage.getItem("token");
 
      const tables = tableRefs.current
        .map((ref) => ref?.getPdfBlock())
        .filter(Boolean);
 
      const res = await fetch("http://localhost:5000/nlp/send-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          tables,
        }),
      });
 
      const data = await res.json();
 
      if (data.success) {
        alert("📧 Your report PDF was sent successfully! Please check your email...");
      } else {
        alert("❌ Failed to send PDF");
      }
    } catch (err) {
      alert("❌ Error while sending PDF");
    } finally {
      setIsSending(false); // 👈 stop loading
    }
  };
 
  return (
    <>
      <p style={{ textAlign: "center", fontSize: "19px", marginTop: "15px" }}>
        <b>Question:</b> {question}
      </p>
 
      <div className="nlp-results-page">
       
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
        <div className="sen">
        <button
          className={`send-pdf-btn ${isSending ? "loading" : ""}`}
          disabled={isSending}
          onClick={sendPdf}
        >
          {isSending ? "Sending..." : "↗️ Send Email"}
        </button>
      </div>
 
        {Object.entries(result.results).map(([table, rows], idx) => (
          <TableWithInsights
            key={table}
            ref={(el) => (tableRefs.current[idx] = el)}
            table={table}
            rows={rows}
          />
        ))}
      </div>
    </>
  );
}
 
export default NLPResults;
 
/* ================= TABLE + INSIGHTS COMPONENT ================= */
const TableWithInsights = forwardRef(({ table, rows }, ref) => {
  const [chartMode, setChartMode] = useState("univariate"); // univariate, bivariate, custom
  const [xMetric, setXMetric] = useState("");
  const [yMetric, setYMetric] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [showFullChart, setShowFullChart] = useState(false);
 
  const tableBlockRef = useRef();
 
  useImperativeHandle(ref, () => ({
    getPdfBlock: () => {
      if (!chartRef.current) {
        return null; // skip if chart not ready
      }
 
      return {
        table: formatTableName(table),
        insights,
        rows: normalizedRows,
        chartImage: chartRef.current.toBase64Image("image/png", 1),
        chartMeta: {
          chartMode,
          xMetric,
          yMetric,
          chartType,
        },
      };
    },
  }));
 
 
 
  if (!rows || rows.length === 0) {
    return (
      <div className="nlp-table-block">
        <h3>{formatTableName(table)}</h3>
        <p>No data found</p>
      </div>
    );
  }
 
  const normalizedRows = rows.map((r) => {
    const obj = {};
    for (const k in r) {
      obj[k] = isNaN(r[k]) ? r[k] : Number(r[k]);
    }
    return obj;
  });
 
  const isTooManyCategoriesForPie =
    chartMode === "univariate" && normalizedRows.length > 10;
 
  const columns = Object.keys(normalizedRows[0]);
  const numericColumns = columns.filter((c) =>
    normalizedRows.some((r) => typeof r[c] === "number"),
  );
  const labelColumn =
    columns.find(
      (c) => typeof normalizedRows[0][c] === "string" && c !== "region",
    ) || columns[0];
 
  const insightsColumns = numericColumns; // Y-values come from insights
 
  useEffect(() => {
    // default selections
    if (!xMetric) setXMetric(columns[0]);
    if (!yMetric) setYMetric(insightsColumns[0]);
  }, [columns, insightsColumns, xMetric, yMetric]);
 
  const COLOR_PALETTE = [
    "#3b82f6",
    "#22c55e",
    "#f97316",
    "#a855f7",
    "#ef4444",
    "#14b8a6",
    "#eab308",
    "#0ea5e9",
  ];
 
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      x: {
        title: { display: true, text: xMetric }
      },
      y: {
        title: { display: true, text: yMetric },
        beginAtZero: true,
        suggestedMax: Math.max(...normalizedRows.map(r => r[yMetric])) * 1.2
      }
    }
  };
 
 
  function generateDistinctColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i); // evenly spread
      colors.push(`hsl(${hue}, 65%, 55%)`);
    }
    return colors;
  }
 
  const chartRef = useRef(null);
  function getGroupedData(xCol, yCol) {
    const map = {};
    normalizedRows.forEach((r) => {
      const xVal = r[xCol];
      const yVal = r[yCol];
      if (map[xVal] == null) map[xVal] = 0;
      map[xVal] += yVal;
    });
 
    const labels = Object.keys(map);
    const values = Object.values(map);
 
    const isLineChart = chartType === "line";
    const isPieOrDonut = chartType === "pie" || chartType === "donut";
 
    const applySingleBlue =
      isLineChart &&
      (chartMode === "univariate" || chartMode === "bivariate") &&
      labels.length >= 25;
 
    let datasetColor;
 
    if (isPieOrDonut) {
      // 🟢 ALWAYS unique colors for pie & donut
      datasetColor = generateDistinctColors(labels.length);
    } else if (isLineChart) {
      datasetColor = applySingleBlue
        ? "#3b82f6"
        : labels.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]);
    } else {
      // 🟦 Bar & others
      if (chartType === "bar" && labels.length > COLOR_PALETTE.length) {
        // too many bars → distinct colors
        datasetColor = generateDistinctColors(labels.length);
      } else {
        // normal bar → brand palette
        datasetColor = labels.map(
          (_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length],
        );
      }
    }
 
    return {
      labels,
      datasets: [
        {
          label: yCol,
          data: values,
          backgroundColor: datasetColor,
          borderColor: datasetColor,
          borderWidth: 2,
          tension: isLineChart ? 0.3 : 0,
        },
      ],
    };
  }
 
  function renderChart() {
    const data = getGroupedData(xMetric, yMetric);
 
    if (
      chartMode === "univariate" &&
      normalizedRows.length > 10 &&
      (chartType === "pie" || chartType === "donut")
    ) {
      return (
        <div className="nlp-empty">
          <p>Pie & Donut charts are hidden when categories exceed 10.</p>
        </div>
      );
    }
 
    if (chartType === "pie")
      return <Pie ref={chartRef} data={data} options={chartOptions} />;
 
    if (chartType === "donut")
      return <Doughnut ref={chartRef} data={data} options={chartOptions} />;
 
    if (chartType === "scatter") {
      const scatterData = {
        datasets: [
          {
            label: `${yMetric} vs ${xMetric}`,
            data: normalizedRows.map((r) => ({
              x: r[xMetric],
              y: r[yMetric],
            })),
            backgroundColor: "#22c55e",
          },
        ],
      };
 
      return (
        <Scatter
          ref={chartRef}
          data={scatterData}
          options={chartOptions}
        />
      );
    }
 
    return chartType === "line" ? (
      <Line ref={chartRef} data={data} options={chartOptions} />
    ) : (
      <Bar ref={chartRef} data={data} options={chartOptions} />
    );
  }
 
 
  const insights = generateInsights(normalizedRows);
 
  return (
    <div className="nlp-table-block" ref={tableBlockRef}>
      <h3>{formatTableName(table)}</h3>
 
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
 
      <div className="chart-controls">
        <div className="metric-selector">
          <label>Chart Mode:</label>
          <select
            value={chartMode}
            onChange={(e) => setChartMode(e.target.value)}
          >
            <option value="univariate">Univariate</option>
            <option value="bivariate">Bivariate</option>
            <option value="custom">Custom</option>
          </select>
        </div>
 
        {/* X-Axis */}
        <div className="metric-selector">
          <label>X-Axis:</label>
          <select value={xMetric} onChange={(e) => setXMetric(e.target.value)}>
            {chartMode === "univariate" ? (
              <option value={labelColumn}>{labelColumn}</option>
            ) : chartMode === "custom" ? (
              columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            ) : (
              insightsColumns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            )}
          </select>
        </div>
 
        {/* Y-Axis */}
        <div className="metric-selector">
          <label>Y-Axis:</label>
          <select value={yMetric} onChange={(e) => setYMetric(e.target.value)}>
            {(chartMode === "custom" ? columns : insightsColumns).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
 
        {/* Chart Type */}
        <div className="metric-selector">
          <label>Chart Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            {chartMode === "univariate" && (
              <>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                {!isTooManyCategoriesForPie && (
                  <>
                    <option value="pie">Pie</option>
                    <option value="donut">Donut</option>
                  </>
                )}
              </>
            )}
            {chartMode === "bivariate" && (
              <>
                <option value="bar">Bar</option>
                <option value="histogram">Histogram</option>
                <option value="line">Line</option>
                <option value="scatter">Scatter</option>
              </>
            )}
            {chartMode === "custom" && (
              <>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="scatter">Scatter</option>
                <option value="pie">Pie</option>
                <option value="donut">Donut</option>
              </>
            )}
          </select>
        </div>
      </div>
 
      <div
        className="chart-wrapper"
        style={{ cursor: "zoom-in" }}
        onClick={() => setShowFullChart(true)}
      >
        <div className="chart-canvas-box">{renderChart()}</div>
      </div>
 
      {showFullChart && (
        <div className="chart-overlay" onClick={() => setShowFullChart(false)}>
          <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setShowFullChart(false)}
            >
              ✕
            </button>
            <div className="chart-canvas-box">{renderChart()}</div>
          </div>
        </div>
      )}
 
      {renderTable(normalizedRows)}
    </div>
  );
});
 
/* ================= INSIGHTS ================= */
function generateInsights(rows) {
  if (!rows || rows.length === 0) return [];
  const insights = [];
  const columns = Object.keys(rows[0]);
  insights.push(`Total records: ${rows.length}`);
  columns.forEach((col) => {
    const values = rows.map((r) => r[col]).filter((v) => v != null);
    if (values.every((v) => typeof v === "number")) {
      const sum = values.reduce((a, b) => a + b, 0);
      insights.push(
        `"${col}" → Total: ${sum}, Avg: ${(sum / values.length).toFixed(2)}`,
      );
    }
  });
  return insights;
}
 
/* ================= TABLE ================= */
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
 
 