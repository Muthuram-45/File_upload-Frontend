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
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [closing, setClosing] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  /* ==========================
     POPUP HELPERS
     ========================== */
  const showPopup = (message, type = "success") => {
    setPopup({ visible: true, message, type });

    setTimeout(() => {
      setClosing(true);
      setTimeout(() => {
        setPopup({ visible: false, message: "", type: "" });
        setClosing(false);
      }, 300);
    }, 3000);
  };

  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setPopup({ visible: false, message: "", type: "" });
      setClosing(false);
    }, 300);
  };

  /* ==========================
     FILE SELECT
     ========================== */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const alreadyAdded = files.some(
      (f) => f.name === selectedFile.name && f.size === selectedFile.size
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

  /* ==========================
     UPLOAD HANDLER
     ========================== */
  const handleUpload = async () => {
    /* 🚫 VIEW ACCESS */
    if (user?.viewOnly) {
      return showPopup(
        "🚫 View-only access.\nPlease login to upload files.",
        "error"
      );
    }

    /* 🚫 INVITED LOGIN (NOT REGISTERED) */
    if (user?.pendingLogin || token === "PENDING_LOGIN") {
      return showPopup(
        "🔐 Please complete login to upload files.",
        "error"
      );
    }

    /* 🚫 NOT LOGGED IN */
    if (!token) {
      return showPopup("🔐 Please login first.", "error");
    }

    if (files.length === 0) {
      return showPopup("⚠️ Select file(s) to upload", "error");
    }

    if (!fileName.trim()) {
      return showPopup("⚠️ Enter file name", "error");
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("name", fileName);

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

      if (res.data?.success) {
        showPopup(
          "✅ File uploaded successfully.\nData processing will start soon.",
          "success"
        );
      }

      /* RESET */
      setFiles([]);
      setFileName("");
      setUploadProgress(0);
      document.getElementById("fileInput").value = "";

    } catch (err) {
      console.error("Upload Error:", err);
      showPopup(err.response?.data?.error || "❌ Upload failed", "error");
      setUploadProgress(0);
    }
  };

  /* ==========================
     UI
     ========================== */
  return (
    <>
      <div className="upload-page">
        <button
          className="close-btnn"
          onClick={() => navigate("/d-oxwilh9dy1")}
        >
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
                  {files.map((file, idx) => (
                    <li key={idx}>📄 {file.name}</li>
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
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              {uploadProgress > 0 && uploadProgress < 100
                ? "Uploading..."
                : "DONE"}
            </button>
          </div>
        </div>

        {/* POPUP */}
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
