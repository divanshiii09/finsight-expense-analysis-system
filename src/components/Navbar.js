import React from "react";
import "./Navbar.css";

function Navbar({ title, onBack, onNext }) {
  return (
    <div className="nav-container">

      {/* LEFT */}
      <div className="nav-left">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>

      {/* CENTER */}
      <div className="nav-title">{title}</div>

      {/* RIGHT */}
      <div className="nav-right">
        {onNext && (
          <button className="next-btn" onClick={onNext}>
            Next →
          </button>
        )}
      </div>

    </div>
  );
}

export default Navbar;