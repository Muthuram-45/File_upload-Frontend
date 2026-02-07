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

  // 🔐 AUTH GUARD (BACK BUTTON FIX)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/l-gy5n8r4v2t", { replace: true });
    }
  }, [navigate]);

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
        alert(
          "📧 Your report PDF was sent successfully! Please check your email...",
        );
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

/* ================= INSIGHTS HELPER ================= */
function formatLabel(label) {
  return label.replace(/"/g, "").replace(/^./, (c) => c.toUpperCase());
}

// 888663.2899999997 -> 888663.28
function formatNumber(num) {
  if (typeof num !== "number") return num;
  return num.toFixed(2);
}

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

  //auto
  useEffect(() => {
    // 🔥 First: old selections clear
    setXMetric("");
    setYMetric("");

    // 🔥 Next: chartMode based default assign
    if (chartMode === "univariate") {
      setXMetric(labelColumn || "");
      setYMetric(insightsColumns?.[0] || "");
    }

    if (chartMode === "bivariate") {
      setXMetric(insightsColumns?.[0] || "");
      setYMetric(insightsColumns?.[1] || insightsColumns?.[0] || "");
    }

    if (chartMode === "custom") {
      setXMetric(columns?.[0] || "");
      setYMetric(columns?.[1] || columns?.[0] || "");
    }
  }, [chartMode]);

  const isAutoChange = useRef(false);

  useEffect(() => {
    isAutoChange.current = true; // 🔥 auto mode ON

    // reset first
    setXMetric("");
    setYMetric("");
    setChartType("");

    if (chartMode === "univariate") {
      setXMetric(labelColumn || "");
      setYMetric(insightsColumns?.[0] || "");
      setChartType("bar");
    }

    if (chartMode === "bivariate") {
      setXMetric(insightsColumns?.[0] || "");
      setYMetric(insightsColumns?.[1] || insightsColumns?.[0] || "");
      setChartType("bar");
    }

    if (chartMode === "custom") {
      setXMetric(columns?.[0] || "");
      setYMetric(columns?.[1] || columns?.[0] || "");
      setChartType("bar");
    }

    // 🔥 auto mode OFF (next tick)
    setTimeout(() => {
      isAutoChange.current = false;
    }, 0);
  }, [chartMode]);
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
        title: { display: true, text: xMetric },
      },
      y: {
        title: { display: true, text: yMetric },
        beginAtZero: true,
        suggestedMax: Math.max(...normalizedRows.map((r) => r[yMetric])) * 1.2,
      },
    },
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
        <Scatter ref={chartRef} data={scatterData} options={chartOptions} />
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
    <div className="nlp-table-block">
      <h3>{formatTableName(table)}</h3>

      {/* TOP SECTION */}
      <div className="top-section">
        {/* INSIGHTS */}
        <div className="insights-box">
          <h4>Insights</h4>
          <ul>
            {insights.map((i, idx) => {
              let formatted = i;

              // label fix
              formatted = formatted.replace(/"([^"]+)"/g, (_, label) =>
                formatLabel(label),
              );

              // number fix (all decimals → 2 digits)
              formatted = formatted.replace(/(\d+\.\d+)/g, (num) =>
                formatNumber(Number(num)),
              );

              return (
                <li key={idx}>
                  <strong>{idx + 1}</strong> {formatted}
                </li>
              );
            })}
          </ul>
        </div>

        {/* CHART SECTION */}
        <div className="chart-sections">
          <div className="chart-controls">
            {/* Chart Mode */}
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
              <select
                value={xMetric}
                onChange={(e) => setXMetric(e.target.value)}
              >
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
              <select
                value={yMetric}
                onChange={(e) => setYMetric(e.target.value)}
              >
                {(chartMode === "custom" ? columns : insightsColumns).map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
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
          {/* CHART PREVIEW */}
          <div
            className="chart-wrapper"
            style={{ cursor: "zoom-in" }}
            onClick={() => setShowFullChart(true)}
          >
            <div className="chart-canvas-box">{renderChart()}</div>
          </div>

          {/* FULLSCREEN POPUP */}
          {showFullChart && (
            <div
              className="chart-overlay"
              onClick={() => setShowFullChart(false)}
            >
              <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
                <button
                  className="nlpchart-close-btn"
                  onClick={() => setShowFullChart(false)}
                >
                  ✕
                </button>

                <div className="chart-canvas-box">{renderChart()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* TABLE – FULL WIDTH */}
      <RenderTable allRows={normalizedRows} />
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
import { FaAngleDoubleRight } from "react-icons/fa";
import { FaAngleDoubleLeft } from "react-icons/fa";
function RenderTable({ allRows }) {
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  if (!allRows || allRows.length === 0) return null;

  const columns = Object.keys(allRows[0]);
  const totalPages = Math.ceil(allRows.length / ROWS_PER_PAGE);

  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const rows = allRows.slice(startIndex, endIndex);

  const MAX_VISIBLE_PAGES = 4;

  let startPage = Math.max(1, page - Math.floor(MAX_VISIBLE_PAGES / 2));
  let endPage = startPage + MAX_VISIBLE_PAGES - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <>
      <div className="nlp-table-wrapper">
        <h4>Detailed Data</h4>

        <div className="nlp-table-scroll">
          <table className="nlp-tbl-full">
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
        <div className="page-btn">
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              <FaAngleDoubleLeft />
            </button>
            {startPage > 1 && (
              <>
                <button
                  className={page === 1 ? "active-page" : ""}
                  onClick={() => setPage(1)}
                >
                  1
                </button>

                {startPage > 2 && <span className="dots">...</span>}
              </>
            )}

            {visiblePages.map((p) => (
              <button
                key={p}
                className={page === p ? "active-page" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            {/* Right side dots ONLY if gap >= 2 */}
            {endPage < totalPages - 1 && <span className="dots">...</span>}

            {/* Always show last page if not in visible range */}
            {endPage < totalPages && (
              <button
                className={page === totalPages ? "active-page" : ""}
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}