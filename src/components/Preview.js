import React, { useState, useEffect } from "react";
import "./Preview.css";
import Navbar from "./Navbar";

function Preview({ onConfirm, onBack }) {

  const [editIncome, setEditIncome] = useState(false);

  const [data, setData] = useState({
    income: "",
    categories: [],
    limits: {}
  });

  const incomeOptions = [
    "Fixed Income",
    "Freelancer",
    "Business",
    "Multiple Income Sources"
  ];

  // ✅ LOAD DATA PROPERLY
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const income = localStorage.getItem(`income_${user.email}`);
    const categories = JSON.parse(localStorage.getItem(`categories_${user.email}`)) || [];
    const limits = JSON.parse(localStorage.getItem(`limits_${user.email}`)) || {};

    setData({
      income: income || "",
      categories,
      limits
    });
  }, []);

  // ✅ UPDATE INCOME
  const handleIncomeChange = (value) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // update state
    setData(prev => ({
      ...prev,
      income: value
    }));

    // ✅ SAVE TO LOCALSTORAGE
    localStorage.setItem(`income_${user.email}`, value);
  };

  // ✅ UPDATE LIMITS
  const handleLimitChange = (category, value) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const numericValue = Number(value); // ✅ FIX: convert to number

  const updatedLimits = {
    ...data.limits,
    [category]: numericValue
  };

  setData(prev => ({
    ...prev,
    limits: updatedLimits
  }));

  localStorage.setItem(
    `limits_${user.email}`,
    JSON.stringify(updatedLimits)
  );
};

  // ✅ CONTINUE BUTTON FIX
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  return (
    <div className="preview-page">

      <Navbar title="Review Details" onBack={onBack} />

      <div className="preview-wrapper">

        <h1 className="preview-title">Review Your Setup</h1>
        <p className="preview-subtitle">
          Please confirm your details before proceeding
        </p>

        <div className="preview-card">

          {/* 🔹 INCOME */}
          <div className="preview-row">
            <div className="label">Income Type</div>

            <div className="value">
              {editIncome ? (
                <select
                  value={data.income}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="preview-input"
                >
                  <option value="">Select Income</option>
                  {incomeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                data.income || "Not set"
              )}
            </div>

            <button onClick={() => setEditIncome(!editIncome)}>
              {editIncome ? "Save" : "Edit"}
            </button>
          </div>

          {/* 🔹 CATEGORIES */}
          <div className="preview-row">
            <div className="label">Selected Categories</div>
            <div className="value">
              {data.categories.length > 0
                ? data.categories.join(", ")
                : "None Selected"}
            </div>
          </div>

          {/* 🔹 LIMITS */}
          <div className="preview-row column">
            <div className="label">Budget Limits</div>

            {data.categories.length > 0 ? (
              data.categories.map((cat) => (
                <div key={cat} className="limit-row">
                  <span className="limit-name">{cat}</span>

                  <input
                    type="number"
                    className="preview-input"
                    value={data.limits?.[cat] || ""}
                    onChange={(e) =>
                      handleLimitChange(cat, e.target.value)
                    }
                  />
                </div>
              ))
            ) : (
              <p>No categories selected</p>
            )}
          </div>

        </div>

        {/* 🔹 ACTIONS */}
        <div className="preview-actions">

  <button
    className="secondary-btn"
    onClick={() => {
      if (onBack) onBack();   // ✅ FIX
    }}
  >
    ← Back
  </button>

  <button
    className="primary-btn"
    onClick={() => {
      if (onConfirm) onConfirm();  // ✅ FIX
    }}
  >
    Continue to Dashboard
  </button>

</div>

      </div>
    </div>
  );
}

export default Preview;