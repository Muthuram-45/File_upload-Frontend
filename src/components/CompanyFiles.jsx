import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CompanyFiles.css";
import Footer from "./Footer";
import { FaDownload } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

function CompanyFiles() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFolders, setProcessedFolders] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

 useEffect(() => {
  const fetchFiles = async () => {
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Response:", res.data);

      setUploadedFiles(res.data.uploadedFiles || []);
      setProcessedFolders(res.data.processedFolders || []);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching files:", err.response?.data || err.message);
      setError("Failed to fetch files. Backend not responding or token invalid.");
    }
  };

  fetchFiles();
}, [token]);


  const handleViewFolder = (folder) => {
    navigate("/p-h7t4k9m3zq", { state: { folder, token } });
  };

  return (
    <>
    <div className="files-page">

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginLeft: '35px',
        }}
      >
        <button
          className="backk-btns"
          onClick={() => navigate('/d-oxwilh9dy1')}
        >
          Back
        </button>

      </div>


      <header className="dashboard-head">
        <h1> File Management Dashboard</h1>
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="split-container">
        {/* LEFT SIDE: Uploaded Files */}
        <div className="file-sec uploaded-section">
          <h2 className="h2"> Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p className="empty-msg">No uploaded files found.</p>
          ) : (
            <table className="files-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>View</th>
                  {/* <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td  className="filename" >{file.name}</td>
                    <td>
                      <a
                        href={`http://localhost:5000${file.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="view-link"
                      >
                         View
                      </a>
                    </td>
                    {/* <td> <FaDownload color="red" /></td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT SIDE: Processed Folders */}
        <div className="file-sec processed-section">
          <h2 className="h2"> Processed Folders</h2>
          {processedFolders.length === 0 ? (
            <p className="empty-msg">No processed folders found.</p>
          ) : (
            <table className="files-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>View</th>
                  {/* <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {processedFolders.map((folder, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td className="filename">{folder.folderName}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewFolder(folder)}
                      >
                        View  <FaEye fontSize={20} /> 
                      </button>
                    </td>
                    {/* <td></td> */}
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
