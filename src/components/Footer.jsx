import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="dashboard-footer">
      <p>© Developed by Daveclar Cloud Solutions.</p>
      <div className="footer-links">
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms & Conditions
        </a>
        <span>|</span>
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        <span>|</span>
        <a href="/disclosures" target="_blank" rel="noopener noreferrer">
          Disclosures
        </a>
      </div>
    </footer>
  );
}

export default Footer;
