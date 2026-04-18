import React from "react";
import "./Preview.css";

function Preview({ data, onEdit, onConfirm }) {
  return (
    <div className="preview-container">

      <h1>Review Your Setup</h1>
      <p>Please confirm your details before proceeding</p>

      <div className="preview-card">
        <h3>Income Type</h3>
        <p>{data.income}</p>

        <h3>Selected Categories</h3>
        <p>{data.categories.join(", ")}</p>

        <h3>Budget Limits</h3>
        {Object.entries(data.limits).map(([k, v]) => (
          <div key={k} className="preview-row">
            <span>{k}</span>
            <span>₹{v}</span>
          </div>
        ))}
      </div>

      <div className="preview-actions">
        <button onClick={onEdit} className="secondary">
          Edit Details
        </button>

        <button onClick={onConfirm}>
          Continue to Dashboard
        </button>
      </div>

    </div>
  );
}

export default Preview;