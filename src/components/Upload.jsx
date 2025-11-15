import React, { useState } from "react";
import axios from "axios";
import "./Upload.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();

  // 🔹 Handle file select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile && !fileName.trim()) {
      // Auto-fill file name if empty
      setFileName(selectedFile.name.split(".").slice(0, -1).join("."));
    }
  };

  // 🔹 Show popup
  const showPopup = (message, type = "success") => {
    setPopup({ message, type, visible: true });

    // Auto close after 3 seconds
    setTimeout(() => {
      setClosing(true);
      setTimeout(() => {
        setPopup({ ...popup, visible: false });
        setClosing(false);
      }, 400);
    }, 3000);
  };

  // 🔹 Close popup manually
  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setPopup({ ...popup, visible: false });
      setClosing(false);
    }, 400);
  };

  // 🔹 Upload logic
  const handleUpload = async () => {
    if (!fileName.trim() || !file) {
      return showPopup("⚠️ Please enter a file name and choose a file.", "error");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return showPopup("❌ Please login first.", "error");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", fileName);

    try {
      setUploadProgress(0);

      await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      showPopup("✅ File uploaded successfully. Data Engineering process will start soon...", "success");
      setFile(null);
      setFileName("");
      setUploadProgress(0);
    } catch (err) {
      console.error("❌ Upload Error:", err);
      showPopup("❌ Upload failed. Please try again.", "error");
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-box">
        {/* 🔹 Close Button (X on top-right) */}
        <button className="close-btnn" onClick={() => navigate("/d-oxwilh9dy1")}>
          ✖
        </button>

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
            <p>
              {file ? (
                <strong>{file.name}</strong>
              ) : (
                <>
                  Drag & Drop file here or <span>Browse</span>
                </>
              )}
            </p>
          </div>

          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* 🔹 Progress Bar */}
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

          <button onClick={handleUpload} className="upload-btn">
            {uploadProgress > 0 && uploadProgress < 100
              ? "Uploading..."
              : "DONE"}
          </button>
        </div>
      </div>

      {/* 🔹 Popup */}
      {popup.visible && (
        <div className={`popup-overlay ${closing ? "hide" : ""}`}>
          <div className={`popup-box ${popup.type}`}>
            <p>{popup.message}</p>
            <button className="popup-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Upload;
