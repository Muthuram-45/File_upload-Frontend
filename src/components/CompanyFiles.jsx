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

  /* ===================================================
     ✅ MARK DUPLICATES + REAL PROCESS CHECK
  =================================================== */
  const markDuplicates = (files, processedFolders) => {
    const processedNames = processedFolders.map((p) => p.folderName);
    const nameMap = {};
    const updated = [...files];

    for (let i = files.length - 1; i >= 0; i--) {
      const file = files[i];

      if (nameMap[file.name]) {
        // ✅ Older duplicate → CANCEL
        updated[i] = { ...file, status: "CANCEL" };
      } else {
        nameMap[file.name] = true;

        // ✅ Only mark DONE when backend actually processed it
        if (processedNames.includes(file.name)) {
          updated[i] = { ...file, status: "DONE" };
        } else {
          updated[i] = { ...file, status: "PROCESSING" };
        }
      }
    }

    return updated;
  };

  useEffect(() => {
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }

    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const uniqueCheck = markDuplicates(
          res.data.uploadedFiles || [],
          res.data.processedFolders || []
        );

        setUploadedFiles(uniqueCheck);
        setProcessedFolders(res.data.processedFolders || []);
        setError("");
      } catch (err) {
        console.error("❌ Error:", err.response?.data || err.message);
        setError("Please Login once again");
      }
    };

    // initial fetch
    fetchFiles();

    // auto refresh
    const interval = setInterval(fetchFiles, 9000);

    return () => clearInterval(interval);
  }, [token]);

  /* ===================================================
      VIEW FUNCTIONS
  =================================================== */

  const handleViewFolder = (folder) => {
    navigate("/p-h7t4k9m3zq", { state: { folder, token } });
  };

  const handleViewChart = (folder) => {
    navigate("/charts-view", { state: { folder, token } });
  };

  /* ===================================================
      STATUS ICON + TOOLTIP
  =================================================== */

  const getStatusIcon = (status) => {
    let icon;
    let title;

    if (status === "DONE") {
      icon = <MdOutlineDownloadDone size={23} color="green" />;
      title = "Processed";
    } else if (status === "CANCEL") {
      icon = <MdCancel size={26} color="red" />;
      title = "Duplicate";
    } else {
      icon = <RxReload size={26} color="orange" className="spin" />;
      title = "Processing";
    }

    return (
      <div className="status-icon">
        {icon}
        <span className="tooltip">{title}</span>
      </div>
    );
  };

  return (
    <>
      <div className="files-page">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginLeft: "35px",
          }}
        >
          <button
            className="backk-btns"
            onClick={() => navigate("/d-oxwilh9dy1")}
          >
            Back
          </button>
        </div>

        <header className="dashboard-head">
          <h1>File Management Dashboard</h1>
        </header>

        {error && <div className="error-box">{error}</div>}

        <div className="split-container">

          {/* ===================== LEFT SIDE ================== */}
          <div className="file-sec uploaded-section">
            <h2 className="h2">Uploaded Files</h2>

            {uploadedFiles.length === 0 ? (
              <p className="empty-msg">No uploaded files found.</p>
            ) : (
              <table className="files-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Actions</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {uploadedFiles.map((file, idx) => (
                    <tr
                      key={idx}
                      className={file.status === "CANCEL" ? "cancel-row" : ""}
                    >
                      <td>{idx + 1}</td>

                      <td className="filename">{file.name}</td>

                      <td>
                        {file.status !== "CANCEL" && (
                          <a
                            href={`http://localhost:5000${file.path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="view-link"
                          >
                            <FaDownload fontSize={20} />
                          </a>
                        )}
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

          {/* ===================== RIGHT SIDE ================== */}
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
                    <tr key={idx}>
                      <td>{idx + 1}</td>

                      <td className="filename">{folder.folderName}</td>

                      <td>
                        <FaEye
                          fontSize={20}
                          className="b1"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewFolder(folder)}
                        />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <BsBarChartFill
                          fontSize={20}
                          className="b2"
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
