import React, { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/upload-statement/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setTransactions(data.transactions);
    setType(data.detected_type);

    // SAVE HISTORY
    const history = JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({
      date: new Date().toLocaleString(),
      type: data.detected_type,
      count: data.transactions.length
    });

    localStorage.setItem("history", JSON.stringify(history));
  };

  return (
    <div className={`dashboard-main ${darkMode ? "dark" : ""}`}>
      <div className="container">

        {/* NAVBAR */}
        <div className="navbar">
          <div className="logo">FinSight</div>

          <div className="nav-actions">
            <div className="tabs">
              <span
                className={`tab ${activeTab === "overview" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </span>

              <span
                className={`tab ${activeTab === "transactions" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("transactions")}
              >
                Transactions
              </span>

              <span
                className={`tab ${activeTab === "history" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                History
              </span>
            </div>

            <div
              className={`theme-circle ${darkMode ? "dark" : "light"}`}
              onClick={() => setDarkMode(!darkMode)}
            ></div>
          </div>
        </div>

        {/* HERO */}
        <div className="hero">
          <h1>Personal Expense Intelligence</h1>
          <p>AI-powered financial insights from your statements</p>
        </div>

        {/* KPI */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <h4>Statement Source</h4>
            <p>{type || "Not uploaded"}</p>
          </div>

          <div className="kpi-card">
            <h4>Total Transactions</h4>
            <p>{transactions.length}</p>
          </div>

          <div className="kpi-card">
            <h4>Status</h4>
            <p>{transactions.length ? "Processed" : "Waiting"}</p>
          </div>
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="top-section">
            <div className="card upload-card">
              <h3>Upload Statement</h3>

              <div className="upload-row">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <button onClick={handleUpload}>
                  Analyze Statement
                </button>
              </div>
            </div>

            <div className="card summary-card">
              <h3>Insights Summary</h3>
              <p>
                We extract transactions and detect spending behavior automatically.
              </p>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "transactions" && transactions.length > 0 && (
          <div className="card table-card">
            <h3>Transaction Ledger</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((txn, i) => (
                    <tr key={i}>
                      <td>{txn.date}</td>
                      <td className={txn.type === "debit" ? "debit" : "credit"}>
                        {txn.type}
                      </td>
                      <td>{txn.description}</td>
                      <td>₹{txn.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="card table-card">
            <h3>Upload History</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Transactions</th>
                  </tr>
                </thead>

                <tbody>
                  {(JSON.parse(localStorage.getItem("history")) || []).map((h, i) => (
                    <tr key={i}>
                      <td>{h.date}</td>
                      <td>{h.type}</td>
                      <td>{h.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;