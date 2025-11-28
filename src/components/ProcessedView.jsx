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

function ProcessedView() {
  const { state } = useLocation();
  const { folder, token } = state || {};
  const navigate = useNavigate();

  const [folderCsvFiles, setFolderCsvFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileData, setActiveFileData] = useState([]);

  const [showCharts, setShowCharts] = useState(false);


  const COLORS = [
    "#007bff",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
    "#845ec2",
    "#d65db1",
    "#ff6f91",
  ];

  /* ==========================================================
     FETCH CSV FILES
  ========================================================== */
  useEffect(() => {
    if (!folder) return;

    axios
      .get(`http://localhost:5000/processed-folder/${folder.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const files = res.data.folder.files.map((f) => ({
          id: f.id,
          name: f.name,
          path: f.path,
        }));

        const sortedFiles = files.sort((a, b) => {
          const normalize = (name) => name.trim().toLowerCase();
          const rank = (name) => {
            if (name.endsWith("_processed_data.csv")) return 1;
            if (name === "entity_table.csv") return 2;
            if (name === "metrics_table.csv") return 3;
            if (name === "dimension_table.csv") return 4;
            return 99;
          };
          return rank(normalize(a.name)) - rank(normalize(b.name));
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
          headers.forEach((h, i) => {
            const num = Number(values[i]);
            obj[h] = isNaN(num) ? values[i] : num;
          });
          return obj;
        });

        setActiveFileData(data);
      })
      .catch((err) => console.log(err));
  }, [activeFile]);

  /* ==========================================================
     CUSTOM X-AXIS TICK
  ========================================================== */
  const CustomizedAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        transform="rotate(-45)"
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  );

  /* ==========================================================
     HELPER TO RENDER ANY CHART
  ========================================================== */
 const renderChart = (chartData, catCol, numCol, color) => {
  // 🔥 Group duplicate category values before chart
  const grouped = {};
  chartData.forEach((row) => {
    const cat = row[catCol];
    const num = Number(row[numCol]) || 0;
    if (cat) grouped[cat] = (grouped[cat] || 0) + num;
  });

  const cleanData = Object.entries(grouped).map(([k, v]) => ({
    [catCol]: k,
    [numCol]: v,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={cleanData}
        margin={{ top: 20, right: 20, left: 30, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={catCol} />
        <YAxis
          type="number"
          allowDecimals={false}
          width={80}
          tick={{ fontSize: 12 }}
          domain={(dataMin, dataMax) => [0, dataMax + dataMax * 0.1]}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey={numCol} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
};


  /* ==========================================================
     DEPARTMENT / POSITION VS SALARY CHARTS
  ========================================================== */
  const renderKeyCharts = (data) => {
    if (!data.length) return null;

    const safeAggregate = (catCol, numCol) => {
      const agg = {};
      data.forEach((r) => {
        const cat = r[catCol];
        const num = Number(r[numCol]);
        if (cat && !isNaN(num)) {
          agg[cat] = (agg[cat] || 0) + num;
        }
      });
      return Object.entries(agg).map(([k, v]) => ({ [catCol]: k, [numCol]: v }));
    };

    const chartConfigs = [
      { catCol: "Department", numCol: "Salary" },
      { catCol: "Position", numCol: "Salary" },
    ];

    return chartConfigs.map(({ catCol, numCol }, index) => {
      const chartData = safeAggregate(catCol, numCol);
      if (!chartData || chartData.length === 0) return null;

      const color = COLORS[index % COLORS.length];
      return (
        <div key={`${catCol}-${numCol}`} className="chart-card">
          <h4>{catCol} vs {numCol}</h4>
          {renderChart(chartData, catCol, numCol, color)}
        </div>
      );
    });
  };

  /* ==========================================================
     AI-DRIVEN CHARTS
  ========================================================== */
  const getImportantComparisons = (data, topN = 5) => {
    if (!data.length) return [];

    const keys = Object.keys(data[0]);
    const exclude = [
      "id", "employee_id", "emp_id", "user_id", "uid", "sid", "pid",
      "order_id", "customer_id", "name", "first_name", "last_name",
      "email", "mobile", "customer_name",
    ];
    const isID = (col) =>
      exclude.includes(col.toLowerCase()) || col.toLowerCase().includes("id");

    const numericCols = keys.filter((col) => {
      const values = data.map((r) => r[col]).filter((v) => typeof v === "number");
      if (!values.length) return false;
      const variance = Math.max(...values) - Math.min(...values);
      const metricKeywords = ["sales", "profit", "quantity", "amount", "revenue", "score"];
      const isMetricKeyword = metricKeywords.some((kw) => col.toLowerCase().includes(kw));
      return !isID(col) && variance > 0 && isMetricKeyword;
    });

    const categoricalCols = keys.filter((col) => {
      if (isID(col)) return false;
      const values = data.map((r) => r[col]).filter((v) => typeof v === "string");
      const uniqueCount = new Set(values).size;
      return uniqueCount > 1 && uniqueCount <= 20;
    });

    const comparisons = [];

    categoricalCols.forEach((cat) => {
      numericCols.forEach((num) => {
        const grouped = {};
        data.forEach((r) => {
          grouped[r[cat]] = grouped[r[cat]] || [];
          grouped[r[cat]].push(r[num]);
        });
        const means = Object.values(grouped).map(
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        const score = Math.max(...means) - Math.min(...means);
        if (score > 0) comparisons.push({ colA: cat, colB: num, type: "mixed", score });
      });
    });

    for (let i = 0; i < categoricalCols.length; i++) {
      for (let j = i + 1; j < categoricalCols.length; j++) {
        const combos = new Set(
          data.map((r) => `${r[categoricalCols[i]]}|${r[categoricalCols[j]]}`)
        );
        if (combos.size > 1)
          comparisons.push({ colA: categoricalCols[i], colB: categoricalCols[j], type: "categorical", score: combos.size });
      }
    }

    comparisons.sort((a, b) => b.score - a.score);
    return comparisons.slice(0, topN);
  };

  const renderCharts = (data) => {
    const comps = getImportantComparisons(data);
    if (!comps.length) return null;

    return comps.map(({ colA, colB, type }, idx) => {
      const color = COLORS[(idx + 2) % COLORS.length];

      if (type === "mixed") {
        const agg = {};
        data.forEach((row) => { agg[row[colA]] = (agg[row[colA]] || 0) + row[colB]; });
        const chartData = Object.entries(agg).map(([k, v]) => ({ [colA]: k, [colB]: v }));

        return (
          <div key={idx} className="chart-card">
            <h4>{colA} vs {colB}</h4>
            {renderChart(chartData, colA, colB, color)}
          </div>
        );
      }

      if (type === "categorical") {
        const freq = {};
        data.forEach((row) => { 
          const key = `${row[colA]}|${row[colB]}`; 
          freq[key] = (freq[key] || 0) + 1; 
        });
        const chartData = Object.entries(freq).map(([k, v]) => {
          const [a, b] = k.split("|");
          return { [colA]: a, [colB]: b, count: v };
        });

        return (
          <div key={idx} className="chart-card">
            <h4>{colA} vs {colB}</h4>
            {renderChart(chartData, colA, "count", color)}
          </div>
        );
      }

      return null;
    });
  };

  

  return (
    <div className="processed-container">
      <h2>{folder?.folderName}</h2>

      <button className="back-btn" onClick={() => navigate("/cf-2g7h9k3l5m")}>Back</button>

      <div className="file-tabs-container">
  {folderCsvFiles.map((file, idx) => {
    const raw = file.name.trim().toLowerCase();
    let tabLabel = file.name;
    if (raw.endsWith("_processed_data.csv")) tabLabel = "Full Table";
    else if (raw === "entity_table.csv") tabLabel = "Entity Table";
    else if (raw === "dimension_table.csv") tabLabel = "Dimension Table";
    else if (raw === "metrics_table.csv") tabLabel = "Metrics Table";

    return (
      <button
        key={idx}
        className={`file-tab-btn ${!showCharts && activeFile?.name === file.name ? "active" : ""}`}
        onClick={() => {
          setShowCharts(false);
          setActiveFile(file);
        }}
      >
        {tabLabel}
      </button>
    );
  })}

  {/* 📊 NEW CHARTS TAB */}
  <button
    className={`file-tab-btn ${showCharts ? "active" : ""}`}
    onClick={() => setShowCharts(true)}
  >
    Charts
  </button>
</div>


  {activeFileData.length > 0 && (
  <div className="csv-table-section">

    {/* 📋 Show Table Only If Table Tab Selected */}
    {!showCharts && (
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
    )}

    {/* 📊 Charts Section Only When Charts Tab Active */}
    {showCharts && (
      <>
        <div className="multi-chart-grid">{renderKeyCharts(activeFileData)}</div>
        <div className="multi-chart-grid">{renderCharts(activeFileData)}</div>
      </>
    )}

  </div>
)}

    </div>
  );
}

export default ProcessedView;
