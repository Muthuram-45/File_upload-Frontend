import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CompanyFiles.css";
import Footer from "./Footer";

import { FaEye } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { RxReload } from "react-icons/rx";
import { MdOutlineDownloadDone, MdCancel } from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";

/* ===============================
   TIME FORMATTER
================================ */
const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function CompanyFiles() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFolders, setProcessedFolders] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* ===============================
     STATUS ICON
  ================================ */
  const getStatusIcon = (status) => {
    switch (status) {
      case "NEW":
      case "PROCESSING":
        return (
          <div className="status-icon">
            <RxReload size={22} color="orange" className="spin" />
            <span className="tooltip">Processing</span>
          </div>
        );
      case "DONE":
        return (
          <div className="status-icon">
            <MdOutlineDownloadDone size={22} color="green" />
            <span className="tooltip">Processed</span>
          </div>
        );
      case "CANCEL":
        return (
          <div className="status-icon">
            <MdCancel size={22} color="red" />
            <span className="tooltip">Duplicate</span>
          </div>
        );
      default:
        return "-";
    }
  };

  /* ===============================
     FETCH FILES
  ================================ */
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
        setError("Error fetching files");
      }
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 9000);
    return () => clearInterval(interval);
  }, [token]);

  /* ===============================
     HELPERS
  ================================ */
  const isProcessed = (fileName) =>
    processedFolders.some((p) => p.folderName === fileName);

  const getProcessedFolder = (fileName) =>
    processedFolders.find((p) => p.folderName === fileName);

  /* ===============================
     NAVIGATION
  ================================ */
  const handleViewFolder = (folder) => {
    navigate("/p-h7t4k9m3zq", { state: { folder, token } });
  };

  const handleViewChart = (folder) => {
    navigate("/charts-view", { state: { folder, token } });
  };

  /* ===============================
     SCHEDULE UI (DB DRIVEN)
  ================================ */
  const renderSchedule = (file) => {
    if (file.source === "API Data") {
      return (
        <div className="schedule-cell schedule-api">
          <span className="last" style={{fontSize:"14px", fontWeight:"500"}}>
            Last Process : {formatTime(file.last_processed_at)}
          </span>
          <span className="next" style={{fontSize:"14px", fontWeight:"500"}}>
            Next Process : {formatTime(file.next_process_at)}
          </span>
        </div>
      );
    }

    return (
      <div className="schedule-cell schedule-uploaded">

        {file.status === "NEW" && (
          <span className="process" style={{fontSize:"14px", fontWeight:"500"}}>Process at<br />12:00</span>
        )}

        {file.status === "PROCESSING" && (
          <>
            <span className="process" style={{fontSize:"14px", fontWeight:"500"}}>Process at</span>
            <span className="completed">
              {formatTime(file.processed_at)}
            </span>
          </>
        )}

        {file.status === "DONE" && (
          <>
            <span className="process" style={{fontSize:"14px", fontWeight:"500"}}>Completed at</span>
            <span className="completed">
              {formatTime(file.completed_at)}
            </span>
          </>
        )}

        {file.status === "CANCEL" && <span style={{fontSize:"14px", fontWeight:"500"}}>Duplicate</span>}
      </div>
    );
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <>
      <div className="files-page">
        <button className="backk-btns" onClick={() => navigate(-1)}>
          Back
        </button>

        <header className="dashboard-head">
          <h1>File Management Dashboard</h1>
        </header>

        {error && <div className="error-box">{error}</div>}

        {/* ================= DESKTOP TABLE ================= */}
        <div className="table-card desktop-only">
          <table className="pro-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Source</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {uploadedFiles.map((file, idx) => {
                const processed = isProcessed(file.name);
                const folderData = getProcessedFolder(file.name);

                return (
                  <tr key={file.id}>
                    <td>{idx + 1}</td>
                    <td className="filename">{file.name}</td>
                    <td>
                      <span className={`source-pill ${file.source === "API Data" ? "api" : "uploaded"}`}>
                        {file.source}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{getStatusIcon(file.status)}</td>
                    <td>{renderSchedule(file)}</td>
                    <td className="action-col">
                      {processed && file.status !== "CANCEL" ? (
                        <>
                          <FaEye onClick={() => handleViewFolder(folderData)} />
                          <BsBarChartFill onClick={() => handleViewChart(folderData)} />
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="mobile-only">
          {uploadedFiles.map((file) => {
            const processed = isProcessed(file.name);
            const folderData = getProcessedFolder(file.name);

            return (
              <div className="file-card" key={file.id}>
                <div className="card-header">
                  <span className="card-title">{file.name}</span>
                  {getStatusIcon(file.status)}
                </div>

                <div className="card-row">
                  <span className="label">Source</span>
                  <span className={`source-pill ${file.source === "API Data" ? "api" : "uploaded"}`}>
                    {file.source}
                  </span>
                </div>

                <div className="card-row">
                  <span className="label">Schedule</span>
                  {renderSchedule(file)}
                </div>

                <div className="card-actions">
                  {processed && file.status !== "CANCEL" ? (
                    <>
                      <FaEye onClick={() => handleViewFolder(folderData)} />
                      <BsBarChartFill onClick={() => handleViewChart(folderData)} />
                    </>
                  ) : (
                    <span className="disabled">No actions</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
      <Footer />
    </>
  );
}

export default CompanyFiles;
