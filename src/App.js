import React, { useState, useEffect } from "react";

import Login from "./components/login";
import IncomeCategory from "./components/IncomeCategory";
import Questionnaire from "./components/Questionnaire";
import SpendingPriority from "./components/SpendingPriority";
import BudgetLimits from "./components/BudgetLimits";
import Preview from "./components/Preview";
import Dashboard from "./components/Dashboard";

function App() {

  // ✅ ALWAYS start from login
  const [step, setStep] = useState("login");

  const [user, setUser] = useState(null);

  const [data, setData] = useState({
    income: "",
    questionnaire: {},
    categories: [],
    limits: {}
  });

  // ✅ Load saved onboarding data ONLY (not auto-login)
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("onboardingData"));
    if (savedData) setData(savedData);
  }, []);

  // ======================
  // ✅ LOGIN HANDLER
  // ======================
  const handleLogin = (userData, isNewUser) => {
    setUser(userData);

    // save user
    localStorage.setItem("user", JSON.stringify(userData));

    if (isNewUser) {
      setStep("income"); // 👉 new user flow
    } else {
      setStep("dashboard"); // 👉 existing user
    }
  };

  // ======================
  // FLOW CONTROL
  // ======================

  if (step === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (step === "income") {
    return (
      <IncomeCategory
        onNext={(val) => {
          const updated = { ...data, income: val };
          setData(updated);
          localStorage.setItem("onboardingData", JSON.stringify(updated));
          setStep("questionnaire");
        }}
      />
    );
  }

  if (step === "questionnaire") {
    return (
      <Questionnaire
        onNext={(val) => {
          const updated = { ...data, questionnaire: val };
          setData(updated);
          localStorage.setItem("onboardingData", JSON.stringify(updated));
          setStep("spending");
        }}
        onBack={() => setStep("income")}
      />
    );
  }

  if (step === "spending") {
    return (
      <SpendingPriority
        selected={data.categories}
        onNext={(val) => {
          const updated = { ...data, categories: val };
          setData(updated);
          localStorage.setItem("onboardingData", JSON.stringify(updated));
          setStep("budget");
        }}
        onBack={() => setStep("questionnaire")}
      />
    );
  }

  if (step === "budget") {
    return (
      <BudgetLimits
        categories={data.categories}
        limits={data.limits}
        onNext={(val) => {
          const updated = { ...data, limits: val };
          setData(updated);
          localStorage.setItem("onboardingData", JSON.stringify(updated));
          setStep("preview");
        }}
        onBack={() => setStep("spending")}
      />
    );
  }

  if (step === "preview") {
    return (
      <Preview
        data={data}
        updateData={setData}
        onConfirm={() => {
          localStorage.setItem("onboardingData", JSON.stringify(data));
          setStep("dashboard");
        }}
        onBack={() => setStep("budget")}
      />
    );
  }

  if (step === "dashboard") {
    return <Dashboard />;
  }

  return null;
}

export default App;