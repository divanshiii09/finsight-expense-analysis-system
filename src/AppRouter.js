import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import IncomeCategory from "./components/IncomeCategory";
import Questionnaire from "./components/Questionnaire";
import SpendingPriority from "./components/SpendingPriority";
import BudgetLimits from "./components/BudgetLimits";

function AppRouter() {
  const [formData, setFormData] = useState({
    incomeCategory: [],
    questionnaire: {},
    spendingPriorities: {},
    budgetLimits: {}
  });

  const updateData = (data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<IncomeCategory updateData={updateData} />}
        />
        <Route
          path="/questionnaire"
          element={<Questionnaire updateData={updateData} />}
        />
        <Route
          path="/spending"
          element={<SpendingPriority
            updateData={updateData}
            formData={formData}
          />}
        />
        <Route
          path="/budget"
          element={<BudgetLimits formData={formData} updateData={updateData} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;