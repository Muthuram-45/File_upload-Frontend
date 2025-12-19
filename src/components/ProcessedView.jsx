import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProcessedView.css";

function ProcessedView() {
  const location = useLocation();
  const { state } = location;
  const { folder, token } = state || {};
  const navigate = useNavigate();

  const [tables, setTables] = useState([]); // { tableName, data: [] }
  const [activeTable, setActiveTable] = useState(null);
  const [error, setError] = useState("");

  // 🔹 NLQ SEARCH STATES
  // const [searchText, setSearchText] = useState("");
  // const [loading, setLoading] = useState(false);

  // ================= SAFE CELL VALUE =================
  const formatCellValue = (value) => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (value === null || value === undefined) return "";
    return String(value);
  };

  // ================= FETCH TABLE DATA =================
  useEffect(() => {
    if (!folder || !token || !folder.tables || folder.tables.length === 0) return;

    const TABLE_PRIORITY = {
      fulltable: 1,
      entity: 2,
      metrics: 3,
      dimension: 4,
    };

    const fetchTables = async () => {
      try {
        const fetchedTables = [];

        const sortedTableNames = [...folder.tables].sort((a, b) => {
          const getPriority = (name) => {
            const lower = name.toLowerCase();
            if (lower.endsWith("_fulltable")) return TABLE_PRIORITY.fulltable;
            if (lower.endsWith("_entity")) return TABLE_PRIORITY.entity;
            if (lower.endsWith("_metrics")) return TABLE_PRIORITY.metrics;
            if (lower.endsWith("_dimension")) return TABLE_PRIORITY.dimension;
            return 99;
          };

          return getPriority(a) - getPriority(b);
        });

        for (const tableName of sortedTableNames) {
          const res = await axios.get(
            `http://localhost:5000/processed-table/${tableName}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          fetchedTables.push({
            tableName,
            data: Array.isArray(res.data.rows) ? res.data.rows : [],
          });
        }

        setTables(fetchedTables);
        if (fetchedTables.length > 0) setActiveTable(fetchedTables[0]);
      } catch (err) {
        console.error("❌ Fetch table error:", err.response?.data || err.message);
        setError("Error fetching table data");
      }
    };

    fetchTables();
  }, [folder, token]);

  // ================= GET FULL TABLE =================
  // const getFullTableName = () => {
  //   if (!tables.length) return null;
  //   return tables.find((t) =>
  //     t.tableName.toLowerCase().endsWith("_fulltable")
  //   )?.tableName;
  // };

 // ================= NLQ SEARCH =================
// const handleSearch = async () => {
//   const fullTable = getFullTableName();

//   // ✅ Frontend validation
//   if (!fullTable) {
//     setError("Full table not loaded yet. Please wait for data to load.");
//     return;
//   }
//   if (!searchText.trim()) {
//     setError("Please enter a search query.");
//     return;
//   }

//   try {
//     setLoading(true);
//     setError("");

//     const res = await axios.post(
//       "http://localhost:5000/nlq-search",
//       {
//         question: searchText.trim(),
//         tableName: fullTable,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (!res.data || !Array.isArray(res.data)) {
//       setError("No results returned from NLQ search.");
//       setActiveTable({ tableName: fullTable, data: [] });
//       return;
//     }

//     setActiveTable({
//       tableName: fullTable,
//       data: res.data,
//     });
//   } catch (err) {
//     console.error("❌ NLQ search error:", err.response?.data || err.message);
//     const msg =
//       err.response?.data?.error ||
//       err.response?.data?.message ||
//       "Search failed. Try another query.";
//     setError(msg);
//     setActiveTable({ tableName: fullTable, data: [] });
//   } finally {
//     setLoading(false);
//   }
// };



  // ================= TAB LABELS =================
  const getTabLabel = (tableName) => {
    const name = tableName.toLowerCase();
    if (name.endsWith("_fulltable")) return "Full Table";
    if (name.endsWith("_entity")) return "Entity Table";
    if (name.endsWith("_metrics")) return "Metrics Table";
    if (name.endsWith("_dimension")) return "Dimension Table";
    return tableName;
  };

  return (
    <div className="processed-container">
      <h2>{folder?.baseName || folder?.folderName}</h2>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      {error && <div className="error-box">{error}</div>}

      {/* ================= NLQ SEARCH ================= */}
      {/* <div className="nlq-search-box">
        <input
          type="text"
          placeholder="Ask like: last 3 month sales details"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div> */}

      {/* ================= TABLE TABS ================= */}
      {tables.length > 0 && (
        <div className="file-tabs-container">
          {tables.map((t, idx) => (
            <button
              key={idx}
              className={`file-tab-btn ${
                activeTable?.tableName === t.tableName ? "active" : ""
              }`}
              onClick={() => setActiveTable(t)}
            >
              {getTabLabel(t.tableName)}
            </button>
          ))}
        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
      {activeTable && activeTable.data.length > 0 ? (
        <div className="csv-table-section">
          <div className="table-wrapper">
            <table className="tbl-full">
              <thead>
                <tr>
                  {Object.keys(activeTable.data[0]).map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTable.data.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j}>{formatCellValue(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        activeTable && <p className="empty-msg">No data found in this table.</p>
      )}
    </div>
  );
}

export default ProcessedView;
