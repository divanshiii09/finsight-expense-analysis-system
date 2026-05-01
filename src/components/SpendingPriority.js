import React, { useState } from "react";
import "./SpendingPriority.css";
import Navbar from "./Navbar";

function SpendingPriority({ onNext, onBack, selected = [] }) {

  const [selectedItems, setSelectedItems] = useState(selected);

  const categories = [
    "Food & Groceries",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Transport",
  ];

  const toggleSelect = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // ✅ FIX FUNCTION
  const handleNext = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // ✅ SAVE PER USER (MAIN FIX)
    localStorage.setItem(
      `categories_${user.email}`,
      JSON.stringify(selectedItems)
    );

    onNext(selectedItems);
  };

  return (
    <>
      <Navbar 
        title="Spending Priority" 
        onBack={onBack} 
        onNext={handleNext}
      />

      <div style={{ paddingTop: "80px" }}>
        <div className="spending-page" style={{ paddingBottom: "60px" }}>
          <div className="spending-wrapper">

            <div className="spending-header">
              <h1>Set Your Spending Priorities</h1>
              <p>Select categories that matter most</p>
            </div>

            <div className="spending-grid">
              {categories.map((item, index) => (
                <div
                  key={index}
                  className={`spending-card ${selectedItems.includes(item) ? "active" : ""}`}
                  onClick={() => toggleSelect(item)}
                >
                  {item}
                </div>
              ))}
            </div>

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

export default SpendingPriority;