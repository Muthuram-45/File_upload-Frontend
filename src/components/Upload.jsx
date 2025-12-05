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

  // ✅ Handle file select ONE BY ONE
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Prevent duplicate
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
      if (updatedFiles.length === 1) {
        setFileName(
          selectedFile.name.split(".").slice(0, -1).join(".")
        );
      } else {
        setFileName(`Merged_${updatedFiles.length}_files`);
      }
    }

    // Reset input so same file can be re-selected if needed
    e.target.value = "";
  };

  // ✅ Show popup
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

  // ✅ Close popup manually
  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setPopup({ message: "", type: "", visible: false });
      setClosing(false);
    }, 400);
  };

  // ✅ Upload logic
  const handleUpload = async () => {
    if (!fileName.trim() || files.length === 0) {
      return showPopup("⚠️ Please enter a file name and choose file(s).", "error");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return showPopup("❌ Please login first.", "error");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("name", fileName);

    try {
      setUploadProgress(0);

      await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      showPopup("✅ File uploaded successfully. Data Engineering process will start soon...", "success");
      setFiles([]);
      setFileName("");
      setUploadProgress(0);

      document.getElementById("fileInput").value = "";

    } catch (err) {
      console.error("❌ Upload Error:", err.response?.data || err.message);
      showPopup(err.response?.data?.error || "❌ Upload failed", "error");
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="upload-page">
        <button className="close-btnn" onClick={() => navigate("/d-oxwilh9dy1")}>
            Back
          </button>
        <div className="upload-box">

          {/* Close Button */}
          

          <h2 className="upload-title">Upload File</h2>

          <div className="upload-form">

            {/* File Name */}
            <input
              type="text"
              placeholder="Enter File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            {/* File Drop Area */}
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
                        alignItems: "center"
                      }}
                    >
                      📄 {file.name}

                      <button
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== index);
                          setFiles(newFiles);

                          if (newFiles.length === 0)
                            setFileName("");
                          else
                            setFileName(
                              `Merged_${newFiles.length}_files`
                            );
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "red",
                          cursor: "pointer",
                          fontSize: "16px"
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

            {/* Hidden input - single file select */}
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Progress Bar */}
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

            {/* Upload Button */}
            <button onClick={handleUpload} className="upload-btn">
              {uploadProgress > 0 && uploadProgress < 100
                ? "Uploading..."
                : "DONE"}
            </button>
          </div>
        </div>

        {/* Popup */}
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
      </div>

      <Footer />
    </>
  );
}

export default Upload;
