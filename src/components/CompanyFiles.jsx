import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CompanyFiles.css";
import Footer from "./Footer";
import { FaEye } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { RxReload } from "react-icons/rx";
import { MdOutlineDownloadDone, MdCancel } from "react-icons/md";

function CompanyFiles() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFolders, setProcessedFolders] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ---------------- Status Icon ----------------
  const getStatusIcon = (status) => {
    switch (status) {
      case "DONE":
        return (
          <div className="status-icon">
            <MdOutlineDownloadDone size={23} color="green" />
            <span className="tooltip">Processed</span>
          </div>
        );
      case "CANCEL":
        return (
          <div className="status-icon">
            <MdCancel size={26} color="red" />
            <span className="tooltip">Duplicate</span>
          </div>
        );
      default:
        return (
          <div className="status-icon">
            <RxReload size={26} color="orange" className="spin" />
            <span className="tooltip">Processing</span>
          </div>
        );
    }
  };

  // ---------------- Fetch Files ----------------
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

        setUploadedFiles(res.data.uploadedFiles || []);
        setProcessedFolders(res.data.processedFolders || []);
        setError("");
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Error fetching files. Please login again.");
      }
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 9000);
    return () => clearInterval(interval);
  }, [token]);

  // ---------------- Navigation ----------------
  const handleViewFolder = (folder) => {
    navigate("/p-h7t4k9m3zq", { state: { folder, token } });
  };

  const handleViewChart = (folder) => {
    navigate("/charts-view", { state: { folder, token } });
  };

  // ---------------- Render ----------------
  return (
    <>
      <div className="files-page">
        <div style={{ display: "flex", justifyContent: "flex-start", marginLeft: "35px" }}>
          <button className="backk-btns" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <header className="dashboard-head">
          <h1>File Management Dashboard</h1>
        </header>

        {error && <div className="error-box">{error}</div>}

        <div className="split-container">
          {/* Files */}
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file, idx) => (
                    <tr key={file.id}>
                      <td>{idx + 1}</td>
                      <td className="filename">{file.name}</td>
                      <td className={`table-cell ${file.source === "API Data" ? "api" : "uploaded"}`}>
                        {file.source}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {getStatusIcon(file.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Processed Tables */}
          <div className="file-sec processed-section">
            <h2 className="h2">Processed Tables</h2>

            {processedFolders.length === 0 ? (
              <p className="empty-msg">No processed tables found.</p>
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
                    <tr key={`processed-${folder.folderName}`}>
                      <td>{idx + 1}</td>
                      <td className="filename">{folder.folderName}</td>
                      <td>
                        <FaEye
                          fontSize={20}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewFolder(folder)}
                        />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <BsBarChartFill
                          fontSize={20}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewChart(folder)}
                        />
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
