import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const [alerts, setAlerts] = useState([]);

  const [showProfile, setShowProfile] = useState(false);

  const [profile, setProfile] = useState({
    name: "User",
    email: "user@email.com"
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("profile"));
    if (saved) setProfile(saved);
  }, []);

  // 🔍 Detect statement source
  const detectSource = (transactions) => {
    if (!transactions.length) return "Not uploaded";

    const text = transactions
      .map(t => t.description?.toLowerCase() || "")
      .join(" ");

    if (text.includes("upi")) return "GPay";
    if (text.includes("hdfc")) return "HDFC Bank";

    return "Bank Statement";
  };

  // 🚀 Upload handler
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/upload-statement/", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    const txns = data.transactions || [];

    setTransactions(txns);
    setType(detectSource(txns));

    checkAlerts(txns); // ✅ run alerts here

    const history = JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({
      date: new Date().toLocaleString(),
      type: detectSource(txns),
      count: txns.length,
      transactions: txns
    });

    localStorage.setItem("history", JSON.stringify(history));

    setLoading(false);
  };

  // 🚨 ALERT SYSTEM (UPGRADED)
  const checkAlerts = (txns) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const limits = JSON.parse(localStorage.getItem(`limits_${user.email}`)) || {};

    let alertData = [];

    Object.keys(limits).forEach((category) => {
      const limit = Number(limits[category]);

      const spent = txns
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      if (limit > 0) {
        const percent = (spent / limit) * 100;

        alertData.push({
          category,
          spent,
          limit,
          percent,
          status:
            percent >= 100 ? "exceeded" :
            percent >= 80 ? "warning" :
            "safe"
        });
      }
    });

    setAlerts(alertData);
  };

  const deleteHistory = (i) => {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.splice(i, 1);
    localStorage.setItem("history", JSON.stringify(history));
    setActiveTab("history");
  };

  return (
    <div className={`dashboard-main ${darkMode ? "dark" : ""}`}>
      <div className="container">

        {/* NAVBAR */}
        <div className="navbar">
          <div>
            <div className="logo">FinSight</div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              Personal Expense Intelligence
            </div>
          </div>

          <div className="nav-actions">

            {/* TABS */}
            <div className="tabs">
              <span
                className={`tab ${activeTab === "overview" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </span>

              <span
                className={`tab ${activeTab === "history" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                History
              </span>
            </div>

            {/* PROFILE */}
            <div
              onClick={() => setShowProfile(!showProfile)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#4f6df5,#6a85ff)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginLeft: "12px"
              }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* THEME TOGGLE */}
            <div
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                marginLeft: "12px",
                cursor: "pointer",
                background: "linear-gradient(to right, #ffffff 50%, #9ca3af 50%)",
                border: "1px solid #d1d5db"
              }}
            ></div>

          </div>
        </div>

        {/* HERO */}
        <div className="hero">
          <h1>
            Welcome, <span style={{ color: "#4f6df5" }}>{profile.name}</span>
          </h1>
        </div>

        {/* 🔥 ALERT UI */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "10px" }}>Budget Insights</h3>

            {alerts.map((a, i) => (
              <div
                key={i}
                style={{
                  background:
                    a.status === "exceeded"
                      ? "#fee2e2"
                      : a.status === "warning"
                      ? "#fef3c7"
                      : "#ecfdf5",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{a.category}</strong>

                  <span>
                    {a.status === "exceeded" && "🔴 Exceeded"}
                    {a.status === "warning" && "🟡 Near Limit"}
                    {a.status === "safe" && "🟢 Safe"}
                  </span>
                </div>

                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  ₹{a.spent} / ₹{a.limit}
                </div>

                <div
                  style={{
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "6px",
                    marginTop: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(a.percent, 100)}%`,
                      height: "100%",
                      background:
                        a.status === "exceeded"
                          ? "#ef4444"
                          : a.status === "warning"
                          ? "#f59e0b"
                          : "#22c55e"
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
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
                    {loading ? "Processing..." : "Analyze Statement"}
                  </button>
                </div>
              </div>

              <div className="card summary-card">
                <h3>Insights Summary</h3>
                <p>AI-powered transaction analysis</p>
              </div>
            </div>

            {transactions.length > 0 && (
              <div className="card table-card">
                <h3>Transaction Ledger</h3>

                <div style={{ maxHeight: "400px", overflow: "auto" }}>
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Need/Want</th>
                        <th>Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((txn, i) => (
                        <tr key={i}>
                          <td>{txn.date}</td>
                          <td>{txn.type}</td>
                          <td>{txn.description}</td>
                          <td>{txn.category || "-"}</td>
                          <td>{txn.need_or_want || "-"}</td>
                          <td>₹{txn.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="card table-card">
            <h3>History</h3>

            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Transactions</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {(JSON.parse(localStorage.getItem("history")) || []).map((h, i) => (
                    <tr key={i}>
                      <td>{h.date}</td>
                      <td>{h.type}</td>
                      <td>{h.count}</td>
                      <td style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px"
                      }}>
                        <button onClick={() => {
                          setTransactions(h.transactions);
                          setType(h.type);
                          checkAlerts(h.transactions);
                          setActiveTab("overview");
                        }}>
                          View
                        </button>

                        <button onClick={() => deleteHistory(i)}>
                          Delete
                        </button>
                      </td>
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