import React, { useState } from "react";
import "./SpendingPriority.css";
import Navbar from "./Navbar";

<Navbar title="Spending Priority" onBack={onBack} />

function SpendingPriority({ onNext }) {
  const [selected, setSelected] = useState([]);

  const categories = [
    "Food & Groceries",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Transport",
  ];

  const toggleSelect = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <div className="spending-page">

      <div className="spending-wrapper">

        {/* HEADER */}
        <div className="spending-header">
          <h1>Set Your Spending Priorities</h1>
          <p>Select categories that matter most to you</p>
        </div>

        {/* GRID */}
        <div className="spending-grid">
          {categories.map((item, index) => (
            <div
              key={index}
              className={`spending-card ${
                selected.includes(item) ? "active" : ""
              }`}
              onClick={() => toggleSelect(item)}
            >
              {item}
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <div className="spending-action">
          <button onClick={() => onNext(selected)}>
            Continue
          </button>
        </div>

      </div>

    </div>
  );
}

export default SpendingPriority;