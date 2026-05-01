import React, { useState } from "react";
import "./Questionnaire.css";

const rangeOptions = [
  "Below ₹10,000",
  "₹10,000 – ₹20,000",
  "₹20,000 – ₹30,000",
  "₹30,000 – ₹50,000",
  "₹50,000 – ₹75,000",
  "₹75,000 – ₹1,00,000",
  "Above ₹1,00,000",
  "Custom"
];

function Questionnaire({ onNext }) {

  const [answers, setAnswers] = useState({
    incomeRange: "",
    customIncome: "",
    spendingRange: "",
    savingRange: ""
  });

  const handleChange = (e) => {
    setAnswers({
      ...answers,
      [e.target.name]: e.target.value
    });
  };

  const handleContinue = () => {
    const finalIncome =
      answers.incomeRange === "Custom"
        ? answers.customIncome
        : answers.incomeRange;

    if (!finalIncome || !answers.spendingRange || !answers.savingRange) {
      alert("Please fill all fields");
      return;
    }

    onNext({
      incomeRange: finalIncome,
      spendingRange: answers.spendingRange,
      savingRange: answers.savingRange
    });
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <h2 className="questionnaire-title">Questionnaire</h2>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>

          <div style={{ flex: "1", minWidth: "300px" }}>
            <div className="form-group">
              <label className="form-label">Income Range</label>

              <select
                className="form-select"
                name="incomeRange"
                value={answers.incomeRange}
                onChange={handleChange}
              >
                <option value="">Select Income Range</option>
                {rangeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              {answers.incomeRange === "Custom" && (
                <input
                  type="number"
                  name="customIncome"
                  placeholder="Enter your monthly income"
                  className="form-input"
                  value={answers.customIncome}
                  onChange={handleChange}
                  style={{ marginTop: "10px" }}
                />
              )}
            </div>
          </div>

          <div style={{ flex: "1", minWidth: "300px" }}>
            <div className="form-group">
              <label className="form-label">Spending Range</label>
              <select className="form-select" name="spendingRange" value={answers.spendingRange} onChange={handleChange}>
                <option value="">Select Spending Range</option>
                {rangeOptions.slice(0, -1).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Saving Range</label>
              <select className="form-select" name="savingRange" value={answers.savingRange} onChange={handleChange}>
                <option value="">Select Saving Range</option>
                {rangeOptions.slice(0, -1).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        <button className="next-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default Questionnaire;