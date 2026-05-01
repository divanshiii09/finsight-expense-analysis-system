import React, { useEffect, useState } from "react";
import "./BudgetLimits.css";
import Navbar from "./Navbar";

function BudgetLimits({ onNext, onBack }) {

  const [categories, setCategories] = useState([]);
  const [limits, setLimits] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const stored = JSON.parse(
      localStorage.getItem(`categories_${user.email}`)
    );

    if (stored && stored.length > 0) {
      setCategories(stored);
    }
  }, []);

  const handleChange = (cat, value) => {
    setLimits({
      ...limits,
      [cat]: value
    });
  };

  const handleNext = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    localStorage.setItem(
      `limits_${user.email}`,
      JSON.stringify(limits)
    );

    onNext(limits);
  };

  return (
    <>
      <Navbar 
        title="Budget Limits" 
        onBack={onBack} 
        onNext={handleNext}
      />

      <div style={{ paddingTop: "80px" }}>
        <div className="spending-page" style={{ paddingBottom: "60px" }}>
          <div className="spending-wrapper">

            {/* HEADER (same style as spending page) */}
            <div className="spending-header">
              <h1>Set Your Budget Limits</h1>
              <p>Define monthly limits for selected categories</p>
            </div>

            {/* CONTENT */}
            {categories.length === 0 ? (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                No categories selected
              </p>
            ) : (
              <div className="spending-grid">
                {categories.map((cat, index) => (
                  <div key={index} className="spending-card">

                    <div style={{ marginBottom: "10px", fontWeight: "500" }}>
                      {cat}
                    </div>

                    <input
                      type="number"
                      placeholder="Enter amount"
                      onChange={(e) => handleChange(cat, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                      }}
                    />

                  </div>
                ))}
              </div>
            )}

            {/* BUTTON */}
            <div className="spending-action" style={{ marginTop: "30px" }}>
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