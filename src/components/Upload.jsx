import React, { useState } from 'react';
import axios from 'axios';
import './Upload.css';
import { FaCloudUploadAlt } from 'react-icons/fa';

function Upload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [popup, setPopup] = useState({ message: '', type: '', visible: false });
  const [closing, setClosing] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // 🔹 Show popup
  const showPopup = (message, type = 'success') => {
    setPopup({ message, type, visible: true });
  };

  // 🔹 Close popup with fade animation
  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setPopup({ ...popup, visible: false });
      setClosing(false);
    }, 500);
  };

  // 🔹 Upload file logic
  const handleUpload = async () => {
    if (!fileName.trim() || !file) {
      return showPopup('⚠️ Please enter a file name and choose a file.', 'error');
    }

    const token = localStorage.getItem('token'); // ✅ JWT token saved at login
    if (!token) {
      return showPopup('❌ Please login first.', 'error');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // ✅ Include JWT for company detection
        },
      });

      showPopup('✅ File uploaded successfully Data Engineering Proceess will Start soon ...', 'success');
      setFile(null);
      setFileName('');
    } catch (err) {
      console.error(err);
      showPopup('❌ Upload failed. Please try again.', 'error');
    }
  };

  return (
    <div className="upload-page">
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
            onClick={() => document.getElementById('fileInput').click()}
          >
            <FaCloudUploadAlt className="upload-icon" />
            <p>Drag & Drop file here or <span>Browse</span></p>
          </div>

          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button onClick={handleUpload} className="upload-btn">DONE</button>
        </div>
      </div>

      {popup.visible && (
        <div className={`popup-overlay ${closing ? 'hide' : ''}`}>
          <div className={`popup-box ${popup.type}`}>
            <p>{popup.message}</p>
            <button className="popup-btn" onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
