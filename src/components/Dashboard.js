import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import InsightsPage from "./InsightsPage";

function Dashboard() {    
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "User",
    email: "user@email.com"
  });
  const [manualTxn, setManualTxn] = useState({
  date: "",
  amount: "",
  description: ""
});

  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);

  const [metrics, setMetrics] = useState({});
const [visuals, setVisuals] = useState({});

// ✅ SEARCH + FILTER STATES
const [searchTerm, setSearchTerm] = useState("");
const [categoryFilter, setCategoryFilter] = useState("all");
const [needWantFilter, setNeedWantFilter] = useState("all");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("profile"));
    if (saved) setProfile(saved);
  }, []);

  // ✅ CATEGORY NORMALIZATION (STRONG FIX)
  const normalizeCategory = (cat = "", desc = "") => {
    const text = (cat + " " + desc).toLowerCase();

    if (text.includes("food") || text.includes("grocery"))
      return "food & groceries";

    if (
      text.includes("bill") ||
      text.includes("recharge") ||
      text.includes("jio") ||
      text.includes("airtel") ||
      text.includes("electric") ||
      text.includes("water") ||
      text.includes("gas") ||
      text.includes("internet") ||
      text.includes("mobile")
    )
      return "bills";

    if (text.includes("shop") || text.includes("amazon") || text.includes("myntra"))
      return "shopping";

    if (text.includes("health"))
      return "health";

    if (text.includes("uber") || text.includes("ola") || text.includes("transport"))
      return "transport";

    return "other / miscellaneous";
  };

  // ✅ SOURCE DETECTION (RESTORED)
  const detectSource = (txns) => {
    if (!txns || txns.length === 0) return "Not uploaded";

    const text = txns
      .map(t => (t.description || "").toLowerCase())
      .join(" ");

    if (text.includes("upi")) return "GPay";
    if (text.includes("hdfc")) return "HDFC Bank";

    return "Bank Statement";
  };

  // ✅ ALERT SYSTEM (FIXED FULLY)
  const checkAlerts = (txns) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return [];

  const rawLimits =
    JSON.parse(localStorage.getItem(`limits_${user.email}`)) || {};

  let normalizedLimits = {};

  Object.keys(rawLimits).forEach(key => {
    const normalizedKey = normalizeCategory(key);
    normalizedLimits[normalizedKey] = Number(rawLimits[key]);
  });

  let totals = {};

  txns.forEach(t => {
    const cat = normalizeCategory(t.category, t.description);
    totals[cat] = (totals[cat] || 0) + Number(t.amount || 0);
  });

  let result = [];

  Object.keys(normalizedLimits).forEach(cat => {
    const spent = totals[cat] || 0;
    const limit = normalizedLimits[cat];

    result.push({
      category: cat,
      spent,
      limit,
      exceeded: spent > limit
    });
  });

  setAlerts(result);

  return result; // ✅ IMPORTANT FIX
};

  // ✅ INSIGHTS
 const generateInsights = (txns, alertsData) => {
  if (!txns.length) return;

  let totals = {};
  let smallTxns = 0;

  txns.forEach(t => {
    const cat = normalizeCategory(t.category, t.description);
    const amount = Number(t.amount || 0);

    totals[cat] = (totals[cat] || 0) + amount;

    if (amount < 200) smallTxns++;
  });

  const totalSpend = Object.values(totals).reduce((a, b) => a + b, 0);

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1]);

  let insightsList = [];

  // 🔹 Top category
  if (sorted.length > 0) {
    const [topCat, topVal] = sorted[0];
    const percent = ((topVal / totalSpend) * 100).toFixed(1);

    insightsList.push(`💸 ${percent}% of your spending is on ${topCat}`);
  }

  // 🔹 Budget insights (FIXED)
  alertsData.forEach(a => {
    if (a.exceeded) {
      insightsList.push(`🚨 You exceeded budget in ${a.category}`);
    } else if (a.limit > 0 && a.spent / a.limit > 0.8) {
      insightsList.push(`⚠️ Near limit in ${a.category}`);
    }
  });

  // 🔹 Behavior
  if (smallTxns > txns.length * 0.5) {
    insightsList.push("📉 Many small transactions detected — impulse spending");
  }

  // 🔹 Spread
  if (sorted.length <= 3) { 
    insightsList.push("✅ Spending is focused and controlled");
  } else {
    insightsList.push("📊 Spending spread across multiple categories");
  }

  // 🔹 Suggestion
  if (sorted.length > 0) {
    insightsList.push(`💡 Try reducing ${sorted[0][0]} expenses`);
  }

  setInsights(insightsList);
};

  // ✅ UPLOAD HANDLER
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
    setMetrics(data.metrics || {});
setVisuals(data.visuals || {});

    setTransactions(txns);
    setType(detectSource(txns));

    const alertsData = checkAlerts(txns) || [];

setAlerts(alertsData);

generateInsights(txns, alertsData);

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

// 👇 ADD HERE
const handleManualTransaction = async () => {
  if (
    !manualTxn.date ||
    !manualTxn.amount ||
    !manualTxn.description
  ) {
    return alert("Please fill all fields");
  }

  try {

    // ADD MANUAL TXN
    await fetch("http://localhost:8000/add-manual-transaction/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: manualTxn.date,
        amount: Number(manualTxn.amount),
        description: manualTxn.description,
        category: "Other",
        classify: "Other"
      })
    });

    // REFRESH DASHBOARD
    const res = await fetch("http://localhost:8000/dashboard-data/");
    const data = await res.json();

    setTransactions(data.transactions || []);
    setMetrics(data.metrics || {});
    setVisuals(data.visuals || {});

    // refresh alerts + insights
    const alertsData =
  checkAlerts(data.transactions || []) || [];

setAlerts(alertsData);

generateInsights(
  data.transactions || [],
  alertsData
);

    setManualTxn({
      date: "",
      amount: "",
      description: ""
    });

  } catch (err) {
    console.error(err);
    alert("Failed to add transaction");
  }
};

// ✅ FILTERED TRANSACTIONS
const filteredTransactions = transactions.filter((txn) => {

  const description =
    (txn.description || "").toLowerCase();

  const category =
    (txn.category || "").toLowerCase();

  const needWant =
    (
      txn.need_or_want ||
      txn.classify ||
      ""
    ).toLowerCase();

  // SEARCH
  const matchesSearch =
    description.includes(searchTerm.toLowerCase());

  // CATEGORY
  const matchesCategory =
    categoryFilter === "all" ||
    category === categoryFilter.toLowerCase();

  // NEED/WANT
  const matchesNeedWant =
    needWantFilter === "all" ||
    needWant === needWantFilter.toLowerCase();

  return (
    matchesSearch &&
    matchesCategory &&
    matchesNeedWant
  );
});

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
              <span
  className={`tab ${activeTab === "insights" ? "active-tab" : ""}`}
  onClick={() => setActiveTab("insights")}
>
  Insights
</span>
            </div>

            {/* PROFILE */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#4f6df5,#6a85ff)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "12px"
              }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* THEME */}
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

              <div
  className="card summary-card"
  onClick={() => setActiveTab("insights")}
  style={{ cursor: "pointer" }}
>
                <h3>Insights Summary</h3>
                {insights.length > 0
                  ? insights.map((i, idx) => <p key={idx}>{i}</p>)
                  : <p>Upload a statement</p>}
              </div>
            </div>
<div className="card" style={{ marginTop: "20px" }}>
  <h3>Add Manual Expense</h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
      gap: "14px",
      marginTop: "16px"
    }}
  >

    {/* DATE */}
    <input
      type="date"
      value={manualTxn.date}
      onChange={(e) =>
        setManualTxn({
          ...manualTxn,
          date: e.target.value
        })
      }
    />

    {/* AMOUNT */}
    <input
      type="number"
      placeholder="Amount"
      value={manualTxn.amount}
      onChange={(e) =>
        setManualTxn({
          ...manualTxn,
          amount: e.target.value
        })
      }
    />

    {/* DESCRIPTION */}
    <input
      type="text"
      placeholder="Description"
      value={manualTxn.description}
      onChange={(e) =>
        setManualTxn({
          ...manualTxn,
          description: e.target.value
        })
      }
    />

    {/* BUTTON */}
    <button onClick={handleManualTransaction}>
      Add Expense
    </button>

  </div>
</div>
          {/* ✅ FINTECH-LEVEL ALERT UI */}
<div
  className="card table-card"
  style={{
    marginTop: "24px",
    marginBottom: "32px",
    paddingBottom: "24px",
    maxHeight: "500px",
    overflowY: "auto",
    overflowX: "hidden"
  }}
>
  <h3>Budget Alerts</h3>

    {alerts.map((a, i) => {
      const percent = a.limit ? (a.spent / a.limit) * 100 : 0;

      return (
        <div
  key={i}
  style={{
    padding: "14px",
    minHeight: "110px",
            borderRadius: "12px",
            marginBottom: "14px",
            background: darkMode ? "#1f2937" : "#f9fafb",
            border: darkMode
              ? "1px solid #374151"
              : "1px solid #e5e7eb"
          }}
        >
          {/* TOP ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <div style={{ fontWeight: "600" }}>
              {a.category}
            </div>

            {/* STATUS BADGE */}
            <div
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: "600",
                background: a.exceeded
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(34,197,94,0.1)",
                color: a.exceeded ? "#ef4444" : "#22c55e"
              }}
            >
              {a.exceeded ? "Exceeded" : "Safe"}
            </div>
          </div>

          {/* AMOUNT */}
          <div
            style={{
              fontSize: "13px",
              marginBottom: "6px",
              color: darkMode ? "#d1d5db" : "#6b7280"
            }}
          >
            ₹{a.spent} spent out of ₹{a.limit}
          </div>

          {/* PROGRESS BAR */}
          <div
            style={{
              height: "8px",
              width: "100%",
              borderRadius: "8px",
              background: darkMode ? "#374151" : "#e5e7eb",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${Math.min(percent, 100)}%`,
                height: "100%",
                borderRadius: "8px",
                background: a.exceeded
                  ? "linear-gradient(90deg,#ef4444,#dc2626)"
                  : "linear-gradient(90deg,#22c55e,#16a34a)"
              }}
            />
          </div>
        </div>
      );
    })}
  </div>

           
            {/* TABLE */}
{transactions.length > 0 && (
  <div
    className="card table-card"
    style={{ marginTop: "24px" }}
  >
                <h3>Transaction Ledger</h3>
                <div

  style={{
    display: "grid",
    gridTemplateColumns:
  "repeat(3,1fr)",
    gap: "14px",
    marginTop: "18px",
    marginBottom: "18px"
  }}
>

  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search description..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    style={{
      height: "48px",
      padding: "12px",
      borderRadius: "12px",
      border: darkMode
        ? "1px solid #374151"
        : "1px solid #d1d5db",
      background: darkMode
        ? "#111827"
        : "#ffffff",
      color: darkMode ? "#fff" : "#111827",
      outline: "none",
      fontSize: "14px"
      
    }}
  />

  {/* CATEGORY */}
  <select
    value={categoryFilter}
    onChange={(e) =>
      setCategoryFilter(e.target.value)
    }
    style={{
      height: "48px",
      padding: "12px",
      borderRadius: "12px",
      border: darkMode
        ? "1px solid #374151"
        : "1px solid #d1d5db",
      background: darkMode
        ? "#111827"
        : "#ffffff",
      color: darkMode ? "#fff" : "#111827",
      outline: "none",
      fontSize: "14px",
      cursor: "pointer"
    }}
  >
    <option value="all">
      All Categories
    </option>

    {[...new Set(
      transactions.map(
        (t) => t.category || "Other"
      )
    )].map((cat, idx) => (
      <option key={idx} value={cat}>
        {cat}
      </option>
    ))}
  </select>

  {/* NEED/WANT */}
  <select
    value={needWantFilter}
    onChange={(e) =>
      setNeedWantFilter(e.target.value)
    }
    style={{
      height: "48px",
      padding: "12px",
      borderRadius: "12px",
      border: darkMode
        ? "1px solid #374151"
        : "1px solid #d1d5db",
      background: darkMode
        ? "#111827"
        : "#ffffff",
      color: darkMode ? "#fff" : "#111827",
      outline: "none",
      fontSize: "14px",
      cursor: "pointer"
    }}
  >
    <option value="all">
      Need + Want
    </option>

    <option value="Need">
      Need
    </option>

    <option value="Want">
      Want
    </option>
  </select>

</div>

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
                      {filteredTransactions.map((txn, i) => (
                        <tr key={i}>
                          <td>{txn.date}</td>
                          <td>{txn.type}</td>
                          <td>{txn.description}</td>
                          <td>{txn.category || "-"}</td>
                          <td>
  {txn.need_or_want ||
   txn.classify ||
   txn.need_want ||
   txn.need_vs_want ||
   "-"}
</td>
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
        {/* INSIGHTS PAGE */}
{activeTab === "insights" && (
 <InsightsPage
  transactions={transactions}
  alerts={alerts}
  insights={insights}
  metrics={metrics}
  visuals={visuals}
  darkMode={darkMode}
  goBack={() => setActiveTab("overview")}
/>
)}

      </div>
    </div>
  );
}

export default Dashboard;