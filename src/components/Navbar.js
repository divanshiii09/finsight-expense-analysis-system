import React from "react";
import "./Navbar.css";

function Navbar({ title, onBack }) {
  return (
    <div className="nav-container">
      <div className="nav-left">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>

      <div className="nav-title">{title}</div>
    </div>
  );
}

export default Navbar;