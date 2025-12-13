import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CompanyFiles.css";
import Footer from "./Footer";
import { FaDownload, FaEye } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { RxReload } from "react-icons/rx";
import { MdOutlineDownloadDone, MdCancel } from "react-icons/md";

function CompanyFiles() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFolders, setProcessedFolders] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // safe numeric conversion for id
  const idNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // group items by a keyField (case-insensitive trimmed)
  const groupByKey = (items, keyField) => {
    const map = Object.create(null);
    for (const it of items) {
      const raw = (it[keyField] || "").toString();
      const key = raw.trim().toLowerCase();
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    return map;
  };

  // Build final file list:
  // - group by file name
  // - sort each group by id desc
  // - mark only the highest-id item as active (DONE/PROCESSING), others CANCEL
  // - return active items sorted desc by id
  const buildFilesFromRaw = (rawFiles, processedFolderNamesSet) => {
    const grouped = groupByKey(rawFiles, "name");
    const finalActive = [];

    Object.keys(grouped).forEach((k) => {
      const group = grouped[k];

      // sort group by id desc
      group.sort((a, b) => idNum(b.id) - idNum(a.id));

      // first one is the "latest"
      const latest = { ...group[0] };
      // recompute status: DONE if a processed folder with same name exists, else PROCESSING
      latest.status = processedFolderNamesSet.has(k) ? "DONE" : "PROCESSING";
      finalActive.push(latest);

      // for completeness, if you want to track duplicates anywhere you could store them,
      // but we set status CANCEL on duplicates only to show in UI if you ever render them.
      // (We do not render duplicates here — only the latest is returned.)
      // If you instead want to show duplicates, you could include them in the returned array.
    });

    // return sorted desc by id
    finalActive.sort((a, b) => idNum(b.id) - idNum(a.id));
    return finalActive;
  };

  // Build final processed folders list: keep only the latest id per folderName
  const buildFoldersFromRaw = (rawFolders) => {
    const grouped = groupByKey(rawFolders, "folderName");
    const finalList = Object.keys(grouped).map((k) => {
      const group = grouped[k];
      group.sort((a, b) => idNum(b.id) - idNum(a.id));
      const top = group[0];
      // ensure shape matches expected fields
      return {
        id: top.id,
        folderName: top.folderName,
        folderPath: top.folderPath,
        tables: top.tables || top.tables_json || {},
        csvCount: top.csvCount ?? (top.tables ? Object.keys(top.tables).length : 0),
        type: top.type || "processed",
      };
    });
    finalList.sort((a, b) => idNum(b.id) - idNum(a.id));
    return finalList;
  };

  useEffect(() => {
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }

    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/files", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawFiles = Array.isArray(res.data.uploadedFiles) ? res.data.uploadedFiles : [];
        const rawFolders = Array.isArray(res.data.processedFolders) ? res.data.processedFolders : [];

        // Build processed folder name set for quick lookup (lowercase trimmed)
        const processedSet = new Set(
          rawFolders
            .map((f) => (f.folderName || "").toString().trim().toLowerCase())
            .filter(Boolean)
        );

        // Build processed folders final list (unique by folderName, highest id)
        const foldersFinal = buildFoldersFromRaw(rawFolders);

        // Build files final list (unique by name, highest id wins, status recomputed)
        const filesFinal = buildFilesFromRaw(rawFiles, processedSet);

        setUploadedFiles(filesFinal);
        setProcessedFolders(foldersFinal);
        setError("");
      } catch (err) {
        console.error("❌ Fetch error:", err.response?.data || err.message || err);
        setError("Please Login once again");
      }
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 9000);
    return () => clearInterval(interval);
  }, [token]);

  const handleViewFolder = (folder) => {
    navigate("/p-h7t4k9m3zq", { state: { folder, token } });
  };

  const handleViewChart = (folder) => {
    navigate("/charts-view", { state: { folder, token } });
  };

  const getStatusIcon = (status) => {
    let icon;
    let label;
    switch (status) {
      case "DONE":
        icon = <MdOutlineDownloadDone size={23} color="green" />;
        label = "Processed";
        break;
      case "CANCEL":
        icon = <MdCancel size={26} color="red" />;
        label = "Duplicate";
        break;
      default:
        icon = <RxReload size={26} color="orange" className="spin" />;
        label = "Processing";
    }
    return (
      <div className="status-icon">
        {icon}
        <span className="tooltip">{label}</span>
      </div>
    );
  };

  return (
    <>
      <div className="files-page">
        <div style={{ display: "flex", justifyContent: "flex-start", marginLeft: "35px" }}>
          <button className="backk-btns" onClick={() => navigate("/d-oxwilh9dy1")}>Back</button>
        </div>

        <header className="dashboard-head">
          <h1>File Management Dashboard</h1>
        </header>

        {error && <div className="error-box">{error}</div>}

        <div className="split-container">
          <div className="file-sec uploaded-section">
            <h2 className="h2">Files</h2>
            {uploadedFiles.length === 0 ? (
              <p className="empty-msg">No files found.</p>
            ) : (
              <table className="files-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Source</th>
                    <th>Download</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file, idx) => (
                    <tr key={`file-${file.id || idx}`} className={file.status === "CANCEL" ? "cancel-row" : ""}>
                      <td>{idx + 1}</td>
                      <td className="filename">{file.name}</td>
                      <td
                        className={`table-cell ${file.source === "API" ? "api" : "uploaded"}`}
                      >
                        {file.source === "API" ? "API Data" : "Uploaded File"}
                      </td>

                      <td>
                        {file.status !== "CANCEL" && file.path && (
                          <a href={`http://localhost:5000${file.path}`} target="_blank" rel="noreferrer" className="view-link">
                            <FaDownload fontSize={20} />
                          </a>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>{getStatusIcon(file.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="file-sec processed-section">
            <h2 className="h2">Processed Folders</h2>
            {processedFolders.length === 0 ? (
              <p className="empty-msg">No processed folders found.</p>
            ) : (
              <table className="files-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Folder Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {processedFolders.map((folder, idx) => (
                    <tr key={`folder-${folder.id || idx}`}>
                      <td>{idx + 1}</td>
                      <td className="filename">{folder.folderName}</td>
                      <td>
                        <FaEye fontSize={20} className="b1" style={{ cursor: "pointer" }} onClick={() => handleViewFolder(folder)} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <BsBarChartFill fontSize={20} className="b2" style={{ cursor: "pointer" }} onClick={() => handleViewChart(folder)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CompanyFiles;
