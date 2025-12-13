import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Papa from "papaparse";
import "./ProcessedView.css";

function ProcessedView() {
  const location = useLocation();
  const { state } = location;
  const { folder, token } = state || {};
  const navigate = useNavigate();

  const [folderCsvFiles, setFolderCsvFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileData, setActiveFileData] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  /* ==========================================================
     GET TABLE CLASS BASED ON FILE NAME
  ========================================================== */
  const getTableClass = () => {
    if (!activeFile?.name) return "tbl-full";

    const name = activeFile.name.trim().toLowerCase();

    if (name.endsWith("_processed_data.csv")) return "tbl-full";
    if (name === "entity_table.csv") return "tbl-entity";
    if (name === "dimension_table.csv") return "tbl-dimension";
    if (name === "metrics_table.csv") return "tbl-metrics";

    return "tbl-full";
  };

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

        if (sortedFiles.length > 0) {
          setActiveFile(sortedFiles[0]);
        }
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
        Papa.parse(res.data, {
          header: true,
          dynamicTyping: true, 
          skipEmptyLines: true,
          complete: function (results) {
            console.log("✅ TOTAL ROWS LOADED:", results.data.length);
            setActiveFileData(results.data);
          },
        });
      })
      .catch((err) => console.log(err.message));
  }, [activeFile]);

  /* ==========================================================
     FORMAT CELL VALUES SAFELY (PREVENT REACT CRASH)
  ========================================================== */
  const formatCellValue = (value) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10); // convert Date → YYYY-MM-DD
    }
    if (value === null || value === undefined) return "";
    return String(value);
  };

  return (
    <div className="processed-container">
      <h2>{folder?.folderName}</h2>

      <button className="back-btn" onClick={() => navigate("/cf-2g7h9k3l5m")}>
        Back
      </button>

      {/* ================= FILE TABS ================= */}
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
              className={`file-tab-btn ${
                !showCharts && activeFile?.name === file.name ? "active" : ""
              }`}
              onClick={() => {
                setShowCharts(false);
                setActiveFile(file);
              }}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* ================= TABLE SECTION ================= */}
      {activeFileData.length > 0 && (
        <div className="csv-table-section">
          {!showCharts && (
            <div className="table-wrapper">
              <table className={getTableClass()}>
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
                        <td key={j}>{formatCellValue(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProcessedView;
