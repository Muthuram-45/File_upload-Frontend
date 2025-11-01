import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompanyFiles.css';

function CompanyFiles() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('https://file-upload-backend-9.onrender.com/files', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(res.data);
      } catch (err) {
        console.error('❌ Error fetching files:', err);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="files-container">
      <h2>📂 Files</h2>
      {files.length === 0 ? (
        <p>No files available for your company.</p>
      ) : (
        <table className="files-table">
          <thead>
            <tr>
              <th>#</th>
              <th>File Name</th>
              <th>File view</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{file.name}</td>
                <td>
                  <a
                    href={`https://file-upload-backend-9.onrender.com${file.path}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔗 View File
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CompanyFiles;
