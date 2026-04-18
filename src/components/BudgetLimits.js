import React, { useState } from "react";
import "./BudgetLimits.css";
import Navbar from "./Navbar";

<Navbar title="Budget Limits" onBack={onBack} />

function BudgetLimits({ selectedCategories = [], onNext }) {

  const [limits, setLimits] = useState({});

  const handleChange = (category, value) => {
    setLimits(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    if (Object.keys(limits).length === 0) {
      alert("Please enter at least one budget");
      return;
    }

    onNext(limits);
  };

  return (
    <div className="budget-page">

      <div className="budget-wrapper">

        {/* HEADER */}
        <div className="budget-header">
          <h1>Set Monthly Budget Limits</h1>
          <p>Define how much you want to spend in each category</p>
        </div>

        {/* GRID */}
        <div className="budget-grid">

          {(selectedCategories || []).map((cat) => (
            <div className="budget-card" key={cat}>
              <h3>{cat}</h3>

              <input
                type="number"
                className="budget-input"
                placeholder="Enter amount (₹)"
                value={limits[cat] || ""}
                onChange={(e) =>
                  handleChange(cat, e.target.value)
                }
              />
            </div>
          ))}

        </div>

        {/* BUTTON */}
        <div className="budget-action">
          <button onClick={handleSave}>
            Save Limits
          </button>
        </div>

      </div>

    </div>
  );
}

export default BudgetLimits;