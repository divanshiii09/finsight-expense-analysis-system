import React, { useState, useEffect } from "react";
import "./BudgetLimits.css";
import Navbar from "./Navbar";

function BudgetLimits({ onNext, onBack }) {

  const [categories, setCategories] = useState([]);
  const [limits, setLimits] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const savedCategories =
      JSON.parse(localStorage.getItem(`categories_${user.email}`)) || [];

    const savedLimits =
      JSON.parse(localStorage.getItem(`limits_${user.email}`)) || {};

    setCategories(savedCategories);
    setLimits(savedLimits);
  }, []);

  const handleChange = (category, value) => {
    setLimits(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleNext = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // ✅ CLEAN SAVE (no empty values)
    const cleanedLimits = {};
    Object.keys(limits).forEach(key => {
      if (limits[key]) {
        cleanedLimits[key] = Number(limits[key]);
      }
    });

    localStorage.setItem(
      `limits_${user.email}`,
      JSON.stringify(cleanedLimits)
    );

    onNext();
  };

  return (
    <>
      <Navbar 
        title="Set Budget Limits" 
        onBack={onBack} 
        onNext={handleNext}
      />

      <div style={{ paddingTop: "80px" }}>
        <div className="budget-page">
          <div className="budget-wrapper">

            <div className="budget-header">
              <h1>Set Monthly Limits</h1>
              <p>Define how much you want to spend</p>
            </div>

            {/* ✅ PROPER GRID (RESTORES UI) */}
            {categories.length > 0 ? (
              <div className="budget-grid">
                {categories.map((cat, index) => (
                  <div key={index} className="budget-card">

                    <div className="budget-name">{cat}</div>

                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7280"
                      }}>
                        ₹
                      </span>

                      <input
                        type="number"
                        className="budget-input"
                        style={{ paddingLeft: "25px" }}
                        placeholder="0"
                        value={limits[cat] || ""}
                        onChange={(e) =>
                          handleChange(cat, e.target.value)
                        }
                      />
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <p>No categories selected</p>
            )}

            <div className="budget-action">
              <button onClick={handleNext}>
                Continue
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default BudgetLimits;