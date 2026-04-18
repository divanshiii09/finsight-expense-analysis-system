import React, { useState } from "react";
import Login from "./components/login";
import IncomeCategory from "./components/IncomeCategory";
import SpendingPriority from "./components/SpendingPriority";
import BudgetLimits from "./components/BudgetLimits";
import Dashboard from "./components/Dashboard";
import Preview from "./components/Preview";
import Questionnaire from "./components/Questionnaire";

function App() {
  const [step, setStep] = useState("login");

  const [data, setData] = useState({
    income: "",
    categories: [],
    priorities: {},
    limits: {}
  });

  return (
    <>
      {step === "login" && (
        <Login onLogin={() => setStep("income")} />
      )}

      {step === "income" && (
        <IncomeCategory
          onNext={(val) => {
            setData({ ...data, income: val });
            setStep("questionnaire");
          }}
        />
      )}

      {step === "questionnaire" && (
        <Questionnaire
          onNext={(categories) => {
            setData({ ...data, categories });
            setStep("priority");
          }}
          onBack={() => setStep("income")}
        />
      )}

      {step === "priority" && (
        <SpendingPriority
          onNext={(priorities) => {
            setData({ ...data, priorities });
            setStep("budget");
          }}
          onBack={() => setStep("questionnaire")}
        />
      )}

      {step === "budget" && (
        <BudgetLimits
          selectedCategories={data.categories}
          onNext={(limits) => {
            setData({ ...data, limits });
            setStep("preview");
          }}
          onBack={() => setStep("priority")}
        />
      )}

      {step === "preview" && (
        <Preview
          data={data}
          onEdit={() => setStep("income")}
          onConfirm={() => setStep("dashboard")}
        />
      )}

      {step === "dashboard" && (
        <Dashboard />
      )}
    </>
  );
}

export default App;