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

function ProcessedView() {
  const { state } = useLocation();
  const { folder, token } = state || {};

  const navigate = useNavigate();
  const [folderCsvFiles, setFolderCsvFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileData, setActiveFileData] = useState([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const COLORS = [
    "#007bff",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
    "#845ec2",
    "#e056fd",
    "#ff6b6b",
    "#2ed573",
  ];

  const TAB_LABELS = {
    full_table: "Full Table",
    entity_table: "Entity Table",
    dimension_table: "Dimension Table",
    metrics_table: "Metrics Table",
  };

  /* ==========================================================
     FETCH CSV FILES + APPLY FINAL TAB ORDER SORT
  ========================================================== */
  useEffect(() => {
    if (!folder) return;

    axios
      .get(`http://localhost:5000/processed-folder/${folder.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let files = res.data.folder.files.map((f) => ({
          id: f.id,
          name: f.name,
          path: f.path,
        }));

        // ⭐ APPLY YOUR SORTING EXACTLY AS YOU SENT
        const sortedFiles = files.sort((a, b) => {
          const normalize = (name) => name.trim().toLowerCase();

          const A = normalize(a.name);
          const B = normalize(b.name);

          // 1️⃣ FULL TABLE (_Processed_Data.csv)
          const isFullA = A.endsWith("_processed_data.csv");
          const isFullB = B.endsWith("_processed_data.csv");

          // 2️⃣ ENTITY table
          const isEntityA = A === "entity_table.csv";
          const isEntityB = B === "entity_table.csv";

          // 3️⃣ DIMENSION table
          const isDimA = A === "dimension_table.csv";
          const isDimB = B === "dimension_table.csv";

          // 4️⃣ METRICS table
          const isMetricA = A === "metrics_table.csv";
          const isMetricB = B === "metrics_table.csv";

          const rankA = isFullA
            ? 1
            : isEntityA
            ? 2
            : isMetricA
            ? 3
            : isDimA
            ? 4
            : 99;

          const rankB = isFullB
            ? 1
            : isEntityB
            ? 2
            : isMetricB 
            ? 3
            : isDimB
            ? 4
            : 99;

          return rankA - rankB;
        });

        setFolderCsvFiles(sortedFiles);

        if (sortedFiles.length > 0) setActiveFile(sortedFiles[0]);
      })
      .catch((err) => console.log(err?.response?.data || err.message));
  }, [folder, token]);

  /* ==========================================================
     LOAD ACTIVE CSV FILE
  ========================================================== */
  useEffect(() => {
    if (!activeFile) return;

    axios
      .get(`http://localhost:5000${activeFile.path}`)
      .then((res) => {
        const rows = res.data.trim().split("\n");
        const headers = rows[0].split(",");

        const data = rows.slice(1).map((row) => {
          const values = row.split(",");
          const obj = {};
          headers.forEach((h, i) => (obj[h] = values[i]));
          return obj;
        });

        setActiveFileData(data);
      })
      .catch((err) => console.log(err));
  }, [activeFile]);

  /* ==========================================================
     NLP: Ask AI Query
  ========================================================== */
  const handleNLPQuery = async () => {
    if (!query.trim()) return setErrorMsg("⚠️ Please enter a query.");

    setProcessing(true);
    setErrorMsg("");
    setResults([]);
    setSummary("");

    try {
      const res = await axios.post(
        "http://localhost:5000/ask-ai",
        { folderId: folder?.id, query },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let { summary, rows } = res.data;

      rows = rows.map((row) => {
        const r = {};
        Object.keys(row).forEach((key) => {
          const num = Number(row[key]);
          r[key] = isNaN(num) ? row[key] : num;
        });
        return r;
      });

      setSummary(summary || "");
      setResults(rows || []);

      if (!rows.length) setErrorMsg("⚠️ No table data found in AI result.");
    } catch (err) {
      console.log("❌ NLP Error:", err);
      setErrorMsg("❌ AI request failed.");
    }

    setProcessing(false);
  };

  /* ==========================================================
     HELPER: Detect chart columns
  ========================================================== */
  const getChartKeys = (data) => {
    if (!data?.length) return null;

    const sample = data[0];
    const keys = Object.keys(sample);

    const labelKey =
      keys.find((k) => /(name|region|product|category|date|city)/i.test(k)) ||
      keys[0];

    const numericKey = keys.find((k) => typeof sample[k] === "number");
    if (!numericKey) return null;

    return { labelKey, valueKey: numericKey };
  };

  return (
    <div className="processed-container">
      <h2>{folder?.folderName}</h2>

      <button className="back-btn" onClick={() => navigate("/cf-2g7h9k3l5m")}>
        Back
      </button>

      {/* NLP INPUT */}
      {/* <div className="nlp-box">
        <input
          type="text"
          placeholder="Ask something about this folder..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button disabled={processing} onClick={handleNLPQuery}>
          {processing ? "Processing..." : "Run"}
        </button>
      </div> */}

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {/* ⭐ FINAL SORTED TABS */}
      <div className="file-tabs-container">
  {folderCsvFiles.map((file, idx) => {
    const raw = file.name.trim().toLowerCase();

    // Convert filename → readable tab name
    let tabLabel = file.name;

    if (raw.endsWith("_processed_data.csv")) tabLabel = "Full Table";
    else if (raw === "entity_table.csv") tabLabel = "Entity Table";
    else if (raw === "dimension_table.csv") tabLabel = "Dimension Table";
    else if (raw === "metrics_table.csv") tabLabel = "Metrics Table";
    else tabLabel = file.name.replace(/\.[^/.]+$/, "");

    return (
      <button
        key={idx}
        className={`file-tab-btn ${
          activeFile?.name === file.name ? "active" : ""
        }`}
        onClick={() => setActiveFile(file)}
      >
        {tabLabel}
      </button>
    );
  })}
</div>


      {/* CSV TABLE */}
     {/* CSV TABLE */}
{activeFileData.length > 0 && (
  <div className="csv-table-section">
    <div
      className={`table-wrapper ${
        activeFile?.name.toLowerCase().endsWith("_processed_data.csv")
          ? "tbl-full"
          : activeFile?.name.toLowerCase() === "entity_table.csv"
          ? "tbl-entity"
          : activeFile?.name.toLowerCase() === "dimension_table.csv"
          ? "tbl-dimension"
          : activeFile?.name.toLowerCase() === "metrics_table.csv"
          ? "tbl-metrics"
          : ""
      }`}
    >
      <table>
        <thead>
          <tr>
            {Object.keys(activeFileData[0]).map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeFileData.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


      {/* AI SUMMARY */}
      {summary && (
        <div className="nlp-answer-box">
          <h3>🧠 AI Analysis</h3>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {/* AI RESULTS + CHARTS */}
      {results.length > 0 &&
        (() => {
          const keys = getChartKeys(results);
          if (!keys) return null;

          const { labelKey, valueKey } = keys;

          const pieData = results
            .map((row) => ({
              name: String(row[labelKey]),
              value: Number(row[valueKey]) || 0,
            }))
            .filter((r) => !isNaN(r.value));

          return (
            <div className="nlp-results">
              <table className="processed-table">
                <thead>
                  <tr>
                    {Object.keys(results[0]).map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      {Object.values(r).map((c, j) => (
                        <td key={j}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="multi-chart-grid">
                <div className="chart-card">
                  <h4>📊 Bar Chart</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={labelKey} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={valueKey} fill="#007bff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h4>📈 Line Chart</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={labelKey} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={valueKey}
                        stroke="#00c49f"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h4>🥧 Pie Chart</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default ProcessedView;
