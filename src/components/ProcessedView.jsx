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

  // 🗂️ Fetch processed CSVs
  useEffect(() => {
    if (!folder) return;
    const fetchFolderFiles = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/processed-folder/${folder.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const files = res.data.folder.files.map((f) => ({
          id: f.id,
          name: f.name,
          path: f.path,
        }));
        setFolderCsvFiles(files);
        if (files.length > 0) setActiveFile(files[0]);
      } catch (err) {
        console.log(err?.response?.data || err.message);
      }
    };
    fetchFolderFiles();
  }, [folder, token]);

  // 📄 Fetch active CSV file data
  useEffect(() => {
    if (!activeFile) return;
    const fetchCsvData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000${activeFile.path}`);
        const csvText = res.data;
        const rows = csvText.trim().split("\n");
        const headers = rows[0].split(",");
        const data = rows.slice(1).map((row) => {
          const values = row.split(",");
          const obj = {};
          headers.forEach((h, i) => (obj[h] = values[i]));
          return obj;
        });
        setActiveFileData(data);
        setErrorMsg("");
      } catch (err) {
        console.log(err?.response?.data || err.message);
      }
    };
    fetchCsvData();
  }, [activeFile]);

  // 🧠 NLP Query handler (LLaMA or GPT)
  const handleNLPQuery = async () => {
    if (!query.trim()) {
      setErrorMsg("⚠️ Enter a query first.");
      return;
    }

    setProcessing(true);
    setErrorMsg("");
    setResults([]);
    setSummary("");

    try {
      const res = await axios.post(
        "http://localhost:5000/nlp-query",
        {
          fileId: activeFile?.id || folder?.id, // ✅ Match backend (LLaMA expects fileId)
          query,
          useGPT: true, // true → LLaMA backend automatically used now
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(res.data?.data || []);
      setSummary(res.data?.summary || "");

      if (!res.data?.data?.length) setErrorMsg("⚠️ No results found.");
    } catch (err) {
      console.error("❌ NLP query error:", err?.response?.data || err.message);
      setErrorMsg("❌ NLP query failed — check backend logs.");
    } finally {
      setProcessing(false);
    }
  };

  // 📊 Identify chartable keys
  const getChartKeys = (data) => {
    if (!data?.length) return null;
    const sample = data[0];
    const keys = Object.keys(sample);
    const labelKey =
      keys.find((k) =>
        /(name|region|product|category|customer|date|type|label|city)/i.test(k)
      ) || keys[0];
    const valueKey =
      keys.find((k) => !isNaN(sample[k])) ||
      keys.find((k) =>
        /(sales|amount|total|revenue|value|price|count|quantity)/i.test(k)
      ) ||
      keys[1];
    return { labelKey, valueKey };
  };

  return (
    <div className="processed-container">
      <h2> {folder?.folderName}</h2>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

     

      {/* 🗂️ File Tabs */}
      <div className="file-tabs-container">
        <div className="file-tabs-left">
          {folderCsvFiles.map((file, idx) => {
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const formattedName = cleanName
              .replace(/[_-]+/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <button
                key={idx}
                className={`file-tab-btn ${
                  activeFile?.name === file.name ? "active" : ""
                }`}
                onClick={() => setActiveFile(file)}
              >
                {formattedName}
              </button>
            );
          })}
        </div>

        <button className="back-btn" onClick={() => navigate("/cf-2g7h9k3l5m")}>
          Back
        </button>
      </div>

      {/* 📋 CSV Table */}
      {activeFileData.length > 0 && (
        <div className="csv-table-section">
          <div className="table-wrapper">
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

      {/* 📊 NLP Results + Charts */}
      {results.length > 0 && (
        <div className="nlp-results">
          {summary && <p className="summary-text">🧠 {summary}</p>}

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

          {getChartKeys(results) && (
            <div className="multi-chart-grid">
              {(() => {
                const { labelKey, valueKey } = getChartKeys(results);
                const pieData = results.map((row) => ({
                  name: String(row[labelKey]),
                  value: Number(row[valueKey]) || 0,
                }));

                return (
                  <>
                    {/* Bar Chart */}
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

                    {/* Line Chart */}
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

                    {/* Pie Chart */}
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
                              <Cell
                                key={i}
                                fill={COLORS[i % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ⚙️ Footer */}
      <div className="dashboard-foote">
        <p>© Developed by Daveclar Cloud Solutions.</p>
        <div className="footer-link">
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms & Conditions
          </a>
          <span>|</span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="/disclosures" target="_blank" rel="noopener noreferrer">
            Disclosures
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProcessedView;
