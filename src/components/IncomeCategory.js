import React from "react";
import "./IncomeCategory.css";
import Navbar from "./Navbar";
<Navbar title="Income Category" />

function IncomeCategory({ onNext }) {

  const handleSelect = (value) => {
    onNext(value);
  };

  return (
    <div className="income-page">

      <div className="income-wrapper">

        {/* HEADER */}
        <div className="income-header">
          <h1>Select Your Income Category</h1>
          <p>Choose the option that best describes your income</p>
        </div>

        {/* GRID */}
        <div className="income-grid">

          <div
            className="income-card"
            onClick={() => handleSelect("Fixed Income")}
          >
            <div className="income-icon">💼</div>
            <div className="income-name">Fixed Income</div>
            <div className="income-desc">
              Salary or stable monthly income
            </div>
          </div>

          <div
            className="income-card"
            onClick={() => handleSelect("Freelancer")}
          >
            <div className="income-icon">🧑‍💻</div>
            <div className="income-name">Freelancer</div>
            <div className="income-desc">
              Project-based or irregular income
            </div>
          </div>

          <div
            className="income-card"
            onClick={() => handleSelect("Business")}
          >
            <div className="income-icon">🏢</div>
            <div className="income-name">Business</div>
            <div className="income-desc">
              Own business or enterprise
            </div>
          </div>

          <div
            className="income-card"
            onClick={() => handleSelect("Multiple Income Sources")}
          >
            <div className="income-icon">🔀</div>
            <div className="income-name">Multiple Sources</div>
            <div className="income-desc">
              Combination of income streams
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default IncomeCategory;