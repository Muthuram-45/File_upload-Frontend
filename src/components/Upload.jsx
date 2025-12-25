import React, { useState } from "react";
import axios from "axios";
import "./Upload.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();

  // ==========================
  // FILE SELECT (ONE BY ONE)
  // ==========================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const alreadyAdded = files.some(
      (file) =>
        file.name === selectedFile.name && file.size === selectedFile.size
    );

    if (alreadyAdded) {
      showPopup("⚠️ File already added", "error");
      return;
    }

    const updatedFiles = [...files, selectedFile];
    setFiles(updatedFiles);

    if (!fileName.trim()) {
      setFileName(
        updatedFiles.length === 1
          ? selectedFile.name.split(".").slice(0, -1).join(".")
          : `Merged_${updatedFiles.length}_files`
      );
    }

    e.target.value = "";
  };

  // ==========================
  // POPUP HANDLERS
  // ==========================
  const showPopup = (message, type = "success") => {
    setPopup({ message, type, visible: true });

    setTimeout(() => {
      setClosing(true);
      setTimeout(() => {
        setPopup({ message: "", type: "", visible: false });
        setClosing(false);
      }, 400);
    }, 3000);
  };

  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setPopup({ message: "", type: "", visible: false });
      setClosing(false);
    }, 400);
  };

  // ==========================
  // UPLOAD
  // ==========================
  const handleUpload = async () => {
    if (files.length === 0) {
      return showPopup("⚠️ Select file(s) to upload", "error");
    }

    if (!fileName.trim()) {
      return showPopup("⚠️ Enter file name", "error");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return showPopup("❌ Please login first", "error");
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("name", fileName); // send input file name to backend

    try {
      setUploadProgress(0);

      const res = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          },
        }
      );

      // ==========================
      // BACKEND RESPONSE
      // ==========================
      if (res.data && res.data.success) {
        showPopup(
          "✅ File upload successfully.\nData engineering work will start soon.",
          "success"
        );
      }


      // RESET
      setFiles([]);
      setFileName("");
      setUploadProgress(0);
      document.getElementById("fileInput").value = "";

    } catch (err) {
      console.error("❌ Upload Error:", err);
      showPopup(err.response?.data?.error || "❌ Upload failed", "error");
      setUploadProgress(0);
    }
  };

  // ==========================
  // UI
  // ==========================
  return (
    <>
      <div className="upload-page">
        <button className="close-btnn" onClick={() => navigate("/d-oxwilh9dy1")}>
          Back
        </button>

        <div className="upload-box">
          <h2 className="upload-title">Upload File</h2>

          <div className="upload-form">
            <input
              type="text"
              placeholder="Enter File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <div
              className="drag-area"
              onClick={() => document.getElementById("fileInput").click()}
            >
              <FaCloudUploadAlt className="upload-icon" />

              {files.length > 0 ? (
                <ul style={{ textAlign: "left", marginTop: "10px" }}>
                  {files.map((file, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      📄 {file.name}
                      <button
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== index);
                          setFiles(newFiles);
                          setFileName(
                            newFiles.length > 1
                              ? `Merged_${newFiles.length}_files`
                              : newFiles.length === 1
                                ? newFiles[0].name.split(".").slice(0, -1).join(".")
                                : ""
                          );
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "red",
                          cursor: "pointer",
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  Click to select file <span>Browse</span>
                </p>
              )}
            </div>

            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {uploadProgress > 0 && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              className="upload-btn"
              disabled={uploadProgress > 0 && uploadProgress < 100} // disable while uploading
            >
              {uploadProgress > 0 && uploadProgress < 100
                ? "Uploading..."
                : "DONE"}
            </button>
          </div>
        </div>

        {popup.visible && (
          <div className={`popup-overlay ${closing ? "hide" : ""}`}>
            <div className={`popup-box ${popup.type}`}>
              <p style={{ whiteSpace: "pre-line" }}>{popup.message}</p>
              <button className="popup-btn" onClick={closePopup}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Upload;
