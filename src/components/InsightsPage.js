import React, { useMemo, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

function InsightsPage({
  transactions,
  alerts,
  insights,
  metrics,
  visuals,
  darkMode,
  goBack
}) {

  transactions = transactions || [];
  alerts = alerts || [];
  insights = insights || [];
  metrics = metrics || {};
  visuals = visuals || {};


  const [
    showCoach,
    setShowCoach
  ] = useState(false);

  const [
    reduction,
    setReduction
  ] = useState(20);


  // AI CHATBOT STATE

  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I am your Financial AI Assistant. Ask me anything about your spending."
    }
  ]);

  const [userInput, setUserInput] = useState("");
  // ✅ Build chart data from transactions
  const categoryTotals = {};

  transactions.forEach((t) => {
    const cat = (t.category || "other").toLowerCase();
    const amount = Number(t.amount || 0);

    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
  });

  // convert to recharts format
  const data = Object.keys(categoryTotals).map((key) => ({
    name: key,
    value: categoryTotals[key]
  }));

  const COLORS = ["#4f6df5", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
  const [
    savedActions,
    setSavedActions
  ] = useState([]);

  const [
    coachMode,
    setCoachMode
  ]
    =
    useState(
      "balanced"
    );

  // ✅ NEED vs WANT ANALYTICS
  const needWantTotals = {
    Need: 0,
    Want: 0
  };

  transactions.forEach((txn) => {

    const type =
      txn.need_or_want ||
      txn.classify ||
      txn.need_want ||
      txn.need_vs_want ||
      "";

    const amount = Number(txn.amount || 0);

    if (type.toLowerCase() === "need") {
      needWantTotals.Need += amount;
    }

    if (type.toLowerCase() === "want") {
      needWantTotals.Want += amount;
    }
  });

  // PIE DATA
  const needWantData = [
    {
      name: "Needs",
      value: needWantTotals.Need
    },
    {
      name: "Wants",
      value: needWantTotals.Want
    }
  ];

  // TOTAL
  const totalNeedWant =
    needWantTotals.Need + needWantTotals.Want;

  // PERCENTAGES
  const needPercent = totalNeedWant
    ? ((needWantTotals.Need / totalNeedWant) * 100).toFixed(1)
    : 0;

  const wantPercent = totalNeedWant
    ? ((needWantTotals.Want / totalNeedWant) * 100).toFixed(1)
    : 0;

  // DISCIPLINE SCORE
  let disciplineScore = 100;

  if (wantPercent > 60) {
    disciplineScore -= 40;
  } else if (wantPercent > 40) {
    disciplineScore -= 25;
  } else if (wantPercent > 25) {
    disciplineScore -= 10;
  }

  const exceededAlerts =
    (alerts || [])
      .filter(
        (a) => a?.exceeded
      )
      .length;

  disciplineScore -= exceededAlerts * 10;

  if (disciplineScore < 0) {
    disciplineScore = 0;
  }

  // MONTHLY TREND
  const monthlyTrendMap = {};

  transactions.forEach((txn) => {

    if (!txn.date) return;

    const month = txn.date.slice(0, 7);

    const type =
      txn.need_or_want ||
      txn.classify ||
      txn.need_want ||
      txn.need_vs_want ||
      "";

    if (!monthlyTrendMap[month]) {
      monthlyTrendMap[month] = {
        month,
        Need: 0,
        Want: 0
      };
    }

    if (type.toLowerCase() === "need") {
      monthlyTrendMap[month].Need += Number(txn.amount || 0);
    }

    if (type.toLowerCase() === "want") {
      monthlyTrendMap[month].Want += Number(txn.amount || 0);
    }
  });

  const monthlyNeedWantData =
    Object.values(monthlyTrendMap);

  // COLORS
  const NEED_WANT_COLORS = [
    "#22c55e",
    "#ef4444"
  ];

  // 📊 Category Data
  const categoryData =
    Array.isArray(visuals?.expense_by_category)
      ? visuals.expense_by_category.map(item => ({
        name: item.category,
        value: item.amount
      }))
      : [];

  // 💰 Total Spend
  const totalSpend = useMemo(() => {
    return (transactions || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  // =======================
  // EXTRA AI METRICS
  // =======================

  // small purchases
  const smallTransactions =
    transactions.filter(
      (t) =>
        Number(t.amount || 0) < 300
    ).length;


  // category spending
  const foodSpend =
    categoryTotals["food"] || 0;

  const shoppingSpend =
    categoryTotals["shopping"] || 0;


  // last week spend
  let lastWeekSpend = 0;

  transactions.forEach((t) => {

    if (!t.date) return;

    const day =
      new Date(t.date).getDate();

    if (day > 24) {

      lastWeekSpend +=
        Number(
          t.amount || 0
        );

    }

  });

  // ✅ DAILY BURN RATE
  const dailyBurnRate = transactions.length
    ? (totalSpend / 30).toFixed(0)
    : 0;

  // ✅ SAVINGS POTENTIAL
  const savingsPotential =
    wantPercent > 40
      ? Math.round((needWantTotals.Want * 0.3))
      : Math.round((needWantTotals.Want * 0.15));

  // ✅ RISK LEVEL
  let riskLevel = "Low";

  if (wantPercent > 50 || exceededAlerts >= 2) {
    riskLevel = "High";
  } else if (wantPercent > 30 || exceededAlerts >= 1) {
    riskLevel = "Medium";
  }

  // ✅ SPENDING STYLE
  let spendingStyle = "Balanced";

  if (wantPercent > 60) {
    spendingStyle = "Impulsive";
  } else if (needPercent > 75) {
    spendingStyle = "Highly Disciplined";
  } else if (wantPercent > 40) {
    spendingStyle = "Lifestyle Focused";
  }

  // ✅ FINANCIAL HEALTH
  let financialHealth = "Excellent";

  if (disciplineScore < 50) {
    financialHealth = "Critical";
  } else if (disciplineScore < 70) {
    financialHealth = "Average";
  } else if (disciplineScore < 85) {
    financialHealth = "Good";
  }

  // 🔝 Top Category
  const topCategory = useMemo(() => {
    if (!categoryData.length) return null;
    return [...categoryData].sort((a, b) => b.value - a.value)[0];
  }, [categoryData]);

  // 🧠 AI Summary
  const aiSummary = useMemo(() => {
    if (!transactions.length) return "Upload a statement to see insights.";

    const alertMsg =
      (alerts || []).find(
        a => a?.exceeded
      )
        ? "Some of your budgets have been exceeded."
        : "You are mostly within your budget limits.";

    return `You spent a total of ₹${totalSpend.toFixed(0)} during this period. 
Your highest spending category was ${topCategory?.name}, indicating a key expense driver. 
${alertMsg} Your spending behavior suggests ${(insights || []).length > 3 ? "diverse financial activity" : "disciplined spending"
      }.`;
  }, [transactions, alerts, insights, totalSpend, topCategory]);

  // ==============================
  // NEXT GEN FINTECH AI ENGINE
  // ==============================

  const recommendations = [];

  function getCoachAdvice(rec) {

    let advice = [];

    /* ===================
    CATEGORY ANALYSIS
    =================== */

    if (topCategory) {

      advice.push(
        `You currently spend most on ${topCategory.name}.`
      );

      if (
        topCategory.value >
        totalSpend * 0.35
      ) {

        advice.push(
          `${topCategory.name} contributes disproportionately to your budget.`
        );

        advice.push(
          `Try reducing this category by 15–20%.`
        );

      }

    }


    /* ===================
    WANTS ANALYSIS
    =================== */

    if (
      wantPercent > 50
    ) {

      advice.push(
        `Your discretionary spending (${wantPercent}%) is unusually high.`
      );

      advice.push(
        `Move at least ₹${Math.round(
          needWantTotals.Want * 0.20
        )} toward savings.`
      );

    }

    else if (
      wantPercent > 35
    ) {

      advice.push(
        `Your wants are manageable but can improve.`
      );

      advice.push(
        `Reduce impulse spending by ₹${Math.round(
          needWantTotals.Want * 0.10
        )}.`
      );

    }

    else {

      advice.push(
        `Your spending distribution looks healthy.`
      );

    }


    /* ===================
    SPENDING SPEED
    =================== */

    if (
      projectedSpend >
      totalSpend * 1.2
    ) {

      advice.push(
        `Your current pace may exceed monthly budget.`
      );

      advice.push(
        `Reduce daily spend to approximately ₹${Math.round(
          dailyBurnRate * 0.80
        )}.`
      );

    }


    /* ===================
    WEEKEND ANALYSIS
    =================== */

    if (
      weekendSpend >
      totalSpend * 0.30
    ) {

      advice.push(
        `Weekend spending contributes heavily.`
      );

      advice.push(
        `Set weekend budget cap of ₹${Math.round(
          weekendSpend * 0.70
        )}.`
      );

    }


    /* ===================
    MICRO LEAKS
    =================== */

    if (
      smallTransactions > 15
    ) {

      advice.push(
        `${smallTransactions} small purchases detected.`
      );

      advice.push(
        `Bundle subscriptions and reduce low-value spending.`
      );

    }


    /* ===================
    RECOVERY PLAN
    =================== */

    let recover = [];

    recover.push(
      `Essentials: ${Math.max(
        70,
        needPercent
      )}%`
    );

    recover.push(
      `Lifestyle: ${Math.min(
        30,
        wantPercent
      )}%`
    );

    recover.push(
      `Savings: 20%`
    );


    /* ===================
    FINAL MESSAGE
    =================== */

    return `

📊 Spending Diagnosis

${advice.join("\n\n")}

━━━━━━━━━━━━━━

💰 Budget Recovery Plan

${recover.join("\n")}

━━━━━━━━━━━━━━

📈 Predicted Savings

₹${savingsPotential}

━━━━━━━━━━━━━━

🎯 Coach Goal

Increase discipline score from
${disciplineScore}
→
${Math.min(
      100,
      disciplineScore + 12
    )}

Expected recovery:
14–30 days

`;

  }

  const achievements = [];

  /* ==========================
  REAL TIME FINTECH SIGNALS
  ========================== */

  // Current day
  const today = new Date().getDate();

  // Projected monthly spending
  const projectedSpend =
    today
      ? Math.round(
        (totalSpend / today) * 30
      )
      : totalSpend;


  // Recent 7 day spend
  let recentSpend = 0;

  (transactions || []).forEach((t) => {

    if (!t.date) return;

    const txnDate =
      new Date(t.date);

    const diff =
      (Date.now() -
        txnDate.getTime())
      /
      (1000 * 60 * 60 * 24);

    if (diff <= 7) {

      recentSpend +=
        Number(t.amount || 0);

    }

  });


  // High value transaction detector
  const highSpendCount =
    (transactions || []).filter(

      t =>
        Number(t.amount) > 3000

    ).length;


  // Weekend spending
  let weekendSpend = 0;

  transactions.forEach((t) => {

    if (!t.date) return;

    const day =
      new Date(
        t.date
      ).getDay();

    if (
      day === 0 ||
      day === 6
    ) {

      weekendSpend +=
        Number(
          t.amount || 0
        );

    }

  });


  // Category frequency
  const categoryFrequency = {};

  transactions.forEach((t) => {

    const c =
      (
        t.category ||
        "Other"
      );

    categoryFrequency[c] =
      (
        categoryFrequency[c] || 0
      ) + 1;

  });

  const topFreqCategory =
    Object.entries(
      categoryFrequency
    )

      .sort(
        (a, b) =>
          b[1] - a[1]
      )

    [0]?.[0];

  const totalTx = transactions.length;

  const avgTxn =
    totalTx
      ? totalSpend / totalTx
      : 0;

  const spendVelocity =
    (
      totalSpend /
      Math.max(
        new Set(
          transactions.map(
            (t) => t.date?.slice(0, 10)
          )
        ).size,
        1
      )
    ).toFixed(0);

  const savingRate =
    (
      (
        needWantTotals.Need /
        Math.max(totalSpend, 1)
      ) * 100
    ).toFixed(0);

  const scoreColor =
    disciplineScore >= 85
      ? "excellent"
      : disciplineScore >= 70
        ? "good"
        : disciplineScore >= 50
          ? "warning"
          : "danger";

  const recoveredSavings =
    Math.round(
      savingsPotential *
      (reduction / 100)
    );

  const recoveredDailySpend =
    Math.max(
      0,
      dailyBurnRate -
      (recoveredSavings / 30)
    ).toFixed(0);

  const coachStrategies = {

    aggressive: [
      "Cut wants by 30%",
      "Move ₹300/day to savings",
      "Freeze shopping for 7 days",
      "Weekend spend limit ₹500"
    ],

    balanced: [
      "Reduce wants by 15%",
      "Track subscriptions",
      "Save ₹150/day",
      "Weekly budget check"
    ],

    comfort: [
      "Reduce wants by 8%",
      "Keep lifestyle spending",
      "Save gradually",
      "Limit impulse buying"
    ]

  };

  const projectedScore =
    Math.min(
      100,
      disciplineScore +
      Math.round(reduction / 5)
    );

  // ======================
  // BUDGET SIMULATOR
  // ======================

  const simulatedSavings =
    Math.round(
      needWantTotals.Want
      *
      (reduction / 100)
    );

  const projectedDiscipline =
    Math.min(
      100,
      disciplineScore +
      Math.round(
        reduction / 5
      )
    );

  const newMonthlySpend =
    Math.round(
      totalSpend -
      simulatedSavings
    );

  const dailyLimit =
    Math.round(
      newMonthlySpend / 30
    );

  const recoveryDays =
    Math.max(
      7,
      Math.round(
        30 -
        (reduction * 0.4)
      )
    );



  // AI Recommendation Helper

  function addRec(
    priority,
    title,
    description,
    action,
    impact
  ) {

    recommendations.push({
      priority,
      title,
      description,
      action,
      impact
    });

  }



  // ========= RISK =========

  if (wantPercent > 55) {

    addRec(

      100,

      "High Lifestyle Inflation",

      `Your discretionary expenses reached ${wantPercent}% of total spending.`,

      "Reduce entertainment/shopping budget by 20%",

      `Save ₹${Math.round(
        needWantTotals.Want * 0.20
      )}`

    );

  }



  // ========= MICRO =========

  if (smallTransactions > 12) {

    addRec(

      85,

      "Subscription & Small Leak Detection",

      `${smallTransactions} low-value purchases detected.`,

      "Bundle recurring purchases",

      "Reduce 8–12% monthly leakage"

    );

  }



  // ========= FOOD =========

  if (foodSpend > 3000) {

    addRec(

      90,

      "Food Optimization Opportunity",

      `Food spending is ₹${foodSpend}.`,

      "Use weekly meal planning",

      `Save ₹${Math.round(
        foodSpend * 0.18
      )}`

    );

  }



  // ========= MONTH END =========

  if (lastWeekSpend >
    totalSpend * 0.35) {

    addRec(

      95,

      "Month-End Cash Burn",

      "Expenses accelerate near month-end.",

      "Introduce weekly caps",

      "Improve cash stability"

    );

  }



  // ========= DISCIPLINE =========

  if (
    disciplineScore > 85
  ) {

    achievements.push(
      "🏆 Elite Financial Discipline"
    );

  }

  if (
    savingRate > 70
  ) {

    achievements.push(
      "💎 Long-Term Saver"
    );

  }

  if (
    wantPercent < 30
  ) {

    achievements.push(
      "🔥 Spending Optimizer"
    );

  }



  // SORT
  recommendations.sort(
    (a, b) =>
      b.priority - a.priority
  );

  /* ==========================
  REAL TIME FINTECH ENGINE
  ========================== */


  // Forecast Overspend
  if (
    projectedSpend >
    totalSpend * 1.2
  ) {

    recommendations.push({

      type: "warning",

      title:
        "Projected Monthly Overspend",

      description:
        `Current pace suggests ₹${projectedSpend} spending this month.`,

      impact:
        `Reduce daily spend by ₹${Math.round(
          (projectedSpend - totalSpend) / 10
        )}`,

      confidence: "96%",

      priority: 100

    });

  }


  // Spending acceleration
  if (
    recentSpend >
    totalSpend * 0.45
  ) {

    recommendations.push({

      type: "warning",

      title:
        "Spending Acceleration",

      description:
        "Your recent spending velocity increased unusually.",

      impact:
        "Pause discretionary spending for 3 days",

      confidence: "94%",

      priority: 95

    });

  }


  // High transaction detector
  if (
    highSpendCount >= 3
  ) {

    recommendations.push({

      type: "insight",

      title:
        "High Ticket Purchases",

      description:
        `${highSpendCount} large transactions detected.`,

      impact:
        "Review one-time expenses",

      confidence: "91%",

      priority: 85

    });

  }


  // Weekend leakage
  if (
    weekendSpend >
    totalSpend * 0.35
  ) {

    recommendations.push({

      type: "habit",

      title:
        "Weekend Overspending",

      description:
        "Weekend expenses contribute heavily.",

      impact:
        "Set a weekend spending cap",

      confidence: "90%",

      priority: 80

    });

  }


  // Category concentration
  if (
    topFreqCategory
  ) {

    recommendations.push({

      type: "success",

      title:
        "Dominant Spending Pattern",

      description:
        `Most spending happens in ${topFreqCategory}.`,

      impact:
        "Create category-based budgeting",

      confidence: "89%",

      priority: 50

    });

  }

  recommendations.sort(
    (a, b) =>
      (b.priority || 0)
      -
      (a.priority || 0)
  );
  // ======================================
  // ACHIEVEMENTS
  // ======================================

  if (disciplineScore >= 85) {
    achievements.push(
      "🏆 Financial Discipline Master"
    );
  }

  if (needPercent >= 75) {
    achievements.push(
      "🔥 Smart Budgeting Expert"
    );
  }

  if (wantPercent < 30) {
    achievements.push(
      "💎 Controlled Lifestyle Spender"
    );
  }

  const handleSendMessage = () => {

    if (!userInput.trim()) return;

    const userMessage = {
      sender: "user",
      text: userInput
    };

    let botReply =
      "I couldn't understand that. Try asking about spending, savings or budget.";

    const question = userInput.toLowerCase();

    if (
      question.includes("spend") ||
      question.includes("spent")
    ) {
      botReply =
        `You spent ₹${totalSpend.toFixed(0)} in total.`;
    }

    else if (
      question.includes("saving")
    ) {
      botReply =
        `Your estimated savings potential is ₹${savingsPotential}.`;
    }

    else if (
      question.includes("discipline")
    ) {
      botReply =
        `Your financial discipline score is ${disciplineScore}/100.`;
    }

    else if (
      question.includes("risk")
    ) {
      botReply =
        `Your current overspending risk level is ${riskLevel}.`;
    }

    else if (
      question.includes("top category")
    ) {
      botReply =
        `Your highest spending category is ${topCategory?.name}.`;
    }

    else if (
      question.includes("want")
    ) {
      botReply =
        `You spend ${wantPercent}% on discretionary purchases.`;
    }

    const botMessage = {
      sender: "bot",
      text: botReply
    };

    setChatMessages(prev => [
      ...prev,
      userMessage,
      botMessage
    ]);

    setUserInput("");
  };

  return (
    <div
      className="container"
      style={{
        marginTop: "20px"
      }}
    >

      {/* HEADER */}

      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <div>

          <h2>
            AI Financial Insights
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "#6b7280"
            }}
          >
            Smart analysis of your spending behavior
          </p>

        </div>

        <button
          onClick={goBack}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#4f6df5",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>

      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          columnGap: "20px",
          rowGap: "32px",
          marginTop: "20px",
          alignItems: "stretch"
        }}
      >

        {/* TOTAL SPEND */}
        <div className="card">
          <h4>Total Spend</h4>

          <p style={{ fontSize: "20px", fontWeight: "600" }}>
            ₹{totalSpend.toFixed(0)}
          </p>
        </div>

        {/* TOP CATEGORY */}
        <div className="card">
          <h4>Top Category</h4>

          <p style={{ fontSize: "18px", fontWeight: "600" }}>
            {topCategory?.name || "-"}
          </p>
        </div>

        {/* TRANSACTIONS */}
        <div className="card">
          <h4>Transactions</h4>

          <p style={{ fontSize: "18px", fontWeight: "600" }}>
            {transactions.length}
          </p>
        </div>

        {/* DISCIPLINE SCORE */}
        <div className="card">
          <h4>Discipline Score</h4>

          <p style={{
            fontSize: "20px",
            fontWeight: "600"
          }}>
            {disciplineScore}/100
          </p>

          <small>
            Needs {needPercent}% | Wants {wantPercent}%
          </small>
        </div>

      </div>

      {/* SMART FINANCIAL HEALTH */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        {/* HEALTH STATUS */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>
            Financial Health
          </h4>

          <div
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color:
                financialHealth === "Excellent"
                  ? "#22c55e"
                  : financialHealth === "Good"
                    ? "#4f6df5"
                    : financialHealth === "Average"
                      ? "#f59e0b"
                      : "#ef4444"
            }}
          >
            {financialHealth}
          </div>

          <small>
            Based on spending discipline
          </small>
        </div>

        {/* SAVINGS POTENTIAL */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>
            Savings Potential
          </h4>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#22c55e"
            }}
          >
            ₹{savingsPotential}
          </div>

          <small>
            Estimated reducible spending
          </small>
        </div>

        {/* RISK LEVEL */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>
            Overspending Risk
          </h4>

          <div
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color:
                riskLevel === "Low"
                  ? "#22c55e"
                  : riskLevel === "Medium"
                    ? "#f59e0b"
                    : "#ef4444"
            }}
          >
            {riskLevel}
          </div>

          <small>
            Based on alerts & wants ratio
          </small>
        </div>

        {/* SPENDING STYLE */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>
            Spending Style
          </h4>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#8b5cf6"
            }}
          >
            {spendingStyle}
          </div>

          <small>
            AI behavioral classification
          </small>
        </div>

        {/* DAILY BURN RATE */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>
            Daily Burn Rate
          </h4>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#ef4444"
            }}
          >
            ₹{dailyBurnRate}
          </div>

          <small>
            Average daily spending
          </small>
        </div>

      </div>

      {/* AI SUMMARY */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>AI Summary</h3>
        <p style={{ lineHeight: "1.7", fontSize: "14px" }}>{aiSummary}</p>
      </div>

      {/* CHARTS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>

        {/* PIE */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Spending Breakdown</h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>

              {/* ✅ Gradient definitions */}
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4f6df5" />
                  <stop offset="100%" stopColor="#6a85ff" />
                </linearGradient>

                <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>

                <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                <linearGradient id="grad4" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}   // donut style
                outerRadius={110}
                paddingAngle={3}
                cornerRadius={10}  // 🔥 rounded slices
              >
                {data.map((entry, index) => {
                  const fills = [
                    "url(#grad1)",
                    "url(#grad2)",
                    "url(#grad3)",
                    "url(#grad4)"
                  ];
                  return <Cell key={index} fill={fills[index % fills.length]} />;
                })}
              </Pie>

              {/* ✅ CENTER LABEL */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  fill: darkMode ? "#e5e7eb" : "#111827"
                }}
              >
                ₹{data.reduce((sum, d) => sum + d.value, 0)}
              </text>

              {/* ✅ TOOLTIP */}
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  background: darkMode ? "#1f2937" : "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              />

              {/* ✅ LEGEND */}
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />

            </PieChart>
          </ResponsiveContainer>
        </div>


        {/* BAR */}
        <div
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: darkMode
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Category Comparison</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>

              {/* GRID */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#374151" : "#e5e7eb"}
              />

              {/* X AXIS */}
              <XAxis
                dataKey="name"
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                tick={{ fontSize: 12 }}
              />

              {/* Y AXIS */}
              <YAxis
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                tick={{ fontSize: 12 }}
              />

              {/* TOOLTIP */}
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  background: darkMode ? "#1f2937" : "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              />

              {/* GRADIENT */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f6df5" />
                  <stop offset="100%" stopColor="#6a85ff" />
                </linearGradient>
              </defs>

              {/* BAR */}
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[10, 10, 0, 0]}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI SPENDING BEHAVIOR PANEL */}
      <div
        style={{
          marginTop: "24px",

          background: darkMode
            ? "linear-gradient(145deg,#0f172a,#111827)"
            : "#ffffff",

          borderRadius: "24px",

          padding: "30px",

          border: darkMode
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid #e5e7eb",

          boxShadow: darkMode
            ? "0 10px 40px rgba(0,0,0,0.45)"
            : "0 10px 30px rgba(0,0,0,0.08)"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >

          <div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "6px"
              }}
            >
              Spending Behavior Intelligence
            </h3>

            <p
              style={{
                fontSize: "13px",
                color: darkMode ? "#94a3b8" : "#6b7280"
              }}
            >
              AI-powered analysis of your spending psychology
            </p>
          </div>

          {/* STATUS BADGE */}
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "14px",

              background:
                wantPercent > 50
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(34,197,94,0.12)",

              color:
                wantPercent > 50
                  ? "#ef4444"
                  : "#22c55e",

              fontWeight: "600",
              fontSize: "13px"
            }}
          >
            {wantPercent > 50
              ? "High Discretionary Spending"
              : "Healthy Financial Behavior"}
          </div>

        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: "30px",
            alignItems: "center"
          }}
        >

          {/* LEFT SIDE */}
          <div>

            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <PieChart>

                {/* GLOW GRADIENTS */}
                <defs>

                  <linearGradient
                    id="needRing"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22c55e"
                    />
                    <stop
                      offset="100%"
                      stopColor="#16a34a"
                    />
                  </linearGradient>

                  <linearGradient
                    id="wantRing"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ef4444"
                    />
                    <stop
                      offset="100%"
                      stopColor="#dc2626"
                    />
                  </linearGradient>

                </defs>

                <Pie
                  data={needWantData}
                  dataKey="value"
                  nameKey="name"

                  innerRadius={85}
                  outerRadius={120}

                  paddingAngle={4}
                  cornerRadius={12}
                >

                  <Cell fill="url(#needRing)" />
                  <Cell fill="url(#wantRing)" />

                </Pie>

                {/* CENTER TEXT */}
                <text
                  x="50%"
                  y="47%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "30px",
                    fontWeight: "700",
                    fill: darkMode
                      ? "#ffffff"
                      : "#111827"
                  }}
                >
                  {disciplineScore}
                </text>

                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "13px",
                    fill: darkMode
                      ? "#94a3b8"
                      : "#6b7280"
                  }}
                >
                  Financial Score
                </text>

                <Tooltip
                  contentStyle={{
                    background: darkMode
                      ? "#0f172a"
                      : "#ffffff",

                    border: darkMode
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid #e5e7eb",

                    borderRadius: "14px",

                    color: darkMode
                      ? "#ffffff"
                      : "#111827",

                    fontSize: "14px",

                    boxShadow:
                      "0 10px 30px rgba(0,0,0,0.35)",

                    padding: "12px"
                  }}

                  itemStyle={{
                    color: darkMode
                      ? "#ffffff"
                      : "#111827",

                    fontWeight: "600"
                  }}

                  labelStyle={{
                    color: darkMode
                      ? "#94a3b8"
                      : "#6b7280",

                    marginBottom: "6px"
                  }}
                />

              </PieChart>
            </ResponsiveContainer>

          </div>

          {/* RIGHT SIDE */}
          <div>

            {/* METRICS */}
            <div
              style={{
                display: "grid",
                gap: "16px"
              }}
            >

              {/* NEEDS */}
              <div
                style={{
                  padding: "18px",
                  borderRadius: "18px",

                  background: darkMode
                    ? "#1e293b"
                    : "#f8fafc"
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8"
                  }}
                >
                  Essential Spending
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#22c55e"
                  }}
                >
                  {needPercent}%
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px"
                  }}
                >
                  ₹{needWantTotals.Need}
                </div>
              </div>

              {/* WANTS */}
              <div
                style={{
                  padding: "18px",
                  borderRadius: "18px",

                  background: darkMode
                    ? "#1e293b"
                    : "#f8fafc"
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8"
                  }}
                >
                  Discretionary Spending
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#ef4444"
                  }}
                >
                  {wantPercent}%
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px"
                  }}
                >
                  ₹{needWantTotals.Want}
                </div>
              </div>

            </div>

            {/* AI ANALYSIS */}
            <div
              style={{
                marginTop: "24px",
                padding: "18px",
                borderRadius: "18px",
                background: darkMode
                  ? "rgba(79,109,245,0.12)"
                  : "#eef2ff",
                border: "1px solid rgba(79,109,245,0.15)"
              }}
            >

              <div
                style={{
                  fontWeight: "700",
                  marginBottom: "10px"
                }}
              >
                AI Behavioral Insight
              </div>

              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.8",
                  color:
                    darkMode
                      ?
                      "#d1d5db"
                      :
                      "#374151"
                }}
              >

                {
                  wantPercent > 60
                    ? "Your spending pattern indicates impulsive discretionary behavior. Reducing non-essential purchases can significantly improve long-term savings."
                    : wantPercent > 35
                      ? "Your spending behavior is moderately balanced. Some discretionary expenses are present but remain within manageable levels."
                      : "Excellent financial discipline detected. Most of your spending is focused on essential categories, indicating strong budgeting habits."
                }

              </div>

            </div>

            {/* PREMIUM MONTHLY TREND */}
            <div
              style={{
                background: darkMode
                  ? "linear-gradient(145deg,#0f172a,#111827)"
                  : "#ffffff",

                padding: "28px",
                borderRadius: "24px",
                marginTop: "24px",

                border: darkMode
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid #e5e7eb",

                boxShadow: darkMode
                  ? "0 10px 40px rgba(0,0,0,0.45)"
                  : "0 10px 30px rgba(0,0,0,0.08)"
              }}
            >

              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px"
                }}
              >

                <div>
                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      marginBottom: "6px"
                    }}
                  >
                    Monthly Spending Trend
                  </h3>

                  <p
                    style={{
                      fontSize: "13px",
                      color: darkMode ? "#94a3b8" : "#6b7280"
                    }}
                  >
                    Smart tracking of Need vs Want expenses
                  </p>
                </div>

                {/* MINI ANALYTICS BADGE */}
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "14px",

                    background:
                      wantPercent > 50
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(34,197,94,0.12)",

                    color:
                      wantPercent > 50
                        ? "#ef4444"
                        : "#22c55e",

                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  {wantPercent > 50
                    ? "High Want Spending"
                    : "Healthy Spending"}
                </div>
              </div>

              {/* CHART */}
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={monthlyNeedWantData}
                  barGap={8}
                >

                  {/* GRADIENTS */}
                  <defs>

                    <linearGradient
                      id="needGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22c55e"
                      />
                      <stop
                        offset="100%"
                        stopColor="#16a34a"
                      />
                    </linearGradient>

                    <linearGradient
                      id="wantGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ef4444"
                      />
                      <stop
                        offset="100%"
                        stopColor="#dc2626"
                      />
                    </linearGradient>

                  </defs>

                  {/* GRID */}
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke={
                      darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "#e5e7eb"
                    }
                  />

                  {/* X AXIS */}
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: darkMode
                        ? "#94a3b8"
                        : "#6b7280",
                      fontSize: 12
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* Y AXIS */}
                  <YAxis
                    tick={{
                      fill: darkMode
                        ? "#94a3b8"
                        : "#6b7280",
                      fontSize: 12
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* TOOLTIP */}
                  <Tooltip
                    cursor={{
                      fill: "rgba(255,255,255,0.03)"
                    }}

                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",

                      background: darkMode
                        ? "#111827"
                        : "#ffffff",

                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.25)",

                      padding: "12px"
                    }}
                  />

                  {/* LEGEND */}
                  <Legend
                    wrapperStyle={{
                      paddingTop: "18px"
                    }}
                  />

                  {/* NEED BAR */}
                  <Bar
                    dataKey="Need"
                    fill="url(#needGradient)"
                    radius={[12, 12, 0, 0]}
                    barSize={24}
                  />

                  {/* WANT BAR */}
                  <Bar
                    dataKey="Want"
                    fill="url(#wantGradient)"
                    radius={[12, 12, 0, 0]}
                    barSize={24}
                  />

                </BarChart>
              </ResponsiveContainer>

              {/* SMART FOOTER */}
              <div
                style={{
                  marginTop: "18px",

                  display: "flex",
                  justifyContent: "space-between",

                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "14px",

                    background: darkMode
                      ? "#1e293b"
                      : "#f8fafc",

                    flex: 1
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8"
                    }}
                  >
                    Total Needs
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#22c55e"
                    }}
                  >
                    ₹{needWantTotals.Need}
                  </div>
                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "14px",

                    background: darkMode
                      ? "#1e293b"
                      : "#f8fafc",

                    flex: 1
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8"
                    }}
                  >
                    Total Wants
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#ef4444"
                    }}
                  >
                    ₹{needWantTotals.Want}
                  </div>
                </div>

              </div>

            </div>


            {/* SMART AI RECOMMENDATION ENGINE */}

            <div
              style={{
                marginTop: "24px",

                background: darkMode
                  ? "linear-gradient(145deg,#0f172a,#111827)"
                  : "#ffffff",

                padding: "30px",

                borderRadius: "24px",

                border: darkMode
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid #e5e7eb",

                boxShadow: darkMode
                  ? "0 10px 40px rgba(0,0,0,0.45)"
                  : "0 10px 30px rgba(0,0,0,0.08)"
              }}
            >

              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%"
                  }}
                >

                  <div>

                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: "700"
                      }}
                    >

                      AI Recommendation Engine

                    </h3>

                    <p
                      style={{
                        fontSize: "13px",
                        color:
                          darkMode
                            ?
                            "#94a3b8"
                            :
                            "#6b7280"
                      }}
                    >

                      Personalized financial intelligence

                    </p>

                  </div>


                  <div
                    style={{

                      padding: "14px 20px",

                      borderRadius: "18px",

                      background:
                        disciplineScore >= 80
                          ?
                          "#22c55e"
                          :
                          disciplineScore >= 60
                            ?
                            "#f59e0b"
                            :
                            "#ef4444",

                      color: "#fff",

                      fontWeight: "700",

                      fontSize: "18px"
                    }}
                  >

                    {disciplineScore}/100

                  </div>

                </div>
              </div>

              {/* ACHIEVEMENTS */}
              {achievements.length > 0 && (

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "24px"
                  }}
                >

                  {achievements.map((a, idx) => (

                    <div
                      key={idx}
                      style={{
                        padding: "10px 16px",

                        borderRadius: "14px",

                        background: darkMode
                          ? "#1e293b"
                          : "#f8fafc",

                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      {a}
                    </div>

                  ))}

                </div>

              )}

              {/* RECOMMENDATION CARDS */}
              <div
                style={{
                  display: "grid",
                  gap: "18px"
                }}
              >

                {recommendations.map((rec, idx) => (

                  <div
                    key={idx}
                    style={{
                      padding: "22px",

                      borderRadius: "20px",

                      background: darkMode
                        ? "#1e293b"
                        : "#f8fafc",

                      border:
                        rec.type === "warning"
                          ? "1px solid rgba(239,68,68,0.25)"
                          : rec.type === "success"
                            ? "1px solid rgba(34,197,94,0.25)"
                            : "1px solid rgba(79,109,245,0.18)"
                    }}
                  >

                    {/* TOP */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "700"
                        }}
                      >
                        {rec.title}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",

                          padding: "6px 10px",

                          borderRadius: "10px",

                          background:
                            rec.type === "warning"
                              ? "rgba(239,68,68,0.12)"
                              : rec.type === "success"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(79,109,245,0.12)"
                        }}
                      >
                        {rec.confidence}
                      </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.8",

                        color: darkMode
                          ? "#d1d5db"
                          : "#374151"
                      }}
                    >
                      {rec.description}
                    </div>

                    {/* IMPACT */}
                    <div
                      style={{

                        marginTop: "14px",

                        padding: "14px",

                        borderRadius: "14px",

                        background:
                          darkMode
                            ?
                            "#0f172a"
                            :
                            "#ffffff"

                      }}
                    >

                      <div
                        style={{
                          fontWeight: "600",
                          marginBottom: "12px"
                        }}
                      >

                        💡 {rec.impact}

                      </div>


                      <button

                        style={{

                          padding: "10px 18px",

                          border: "none",

                          borderRadius: "12px",

                          cursor: "pointer",

                          fontWeight: "600",

                          background:

                            savedActions.includes(
                              rec.title
                            )

                              ?

                              "#22c55e"

                              :

                              "#4f6df5",

                          color: "#fff"

                        }}

                        disabled={
                          savedActions.includes(
                            rec.title
                          )
                        }

                        onClick={() => {

                          setSavedActions(
                            prev =>
                              [
                                ...prev,
                                rec.title
                              ]
                          );

                          setShowCoach(true);

                        }}

                      >

                        {

                          savedActions.includes(
                            rec.title
                          )

                            ?

                            "✓ Applied"

                            :

                            rec.type === "warning"

                              ?

                              "Reduce Spending"

                              :

                              rec.type === "habit"

                                ?

                                "Build Habit"

                                :

                                rec.type === "success"

                                  ?

                                  "Continue Strategy"

                                  :

                                  "Optimize Budget"

                        }

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* AI CHATBOT */}

            <div
              style={{
                marginTop: "25px",
                background: darkMode ? "#111827" : "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: darkMode
                  ? "0 4px 20px rgba(0,0,0,0.4)"
                  : "0 4px 20px rgba(0,0,0,0.08)"
              }}
            >
              <h3>🤖 Financial AI Chatbot</h3>

              <div
                style={{
                  height: "300px",
                  overflowY: "auto",
                  marginTop: "15px",
                  padding: "10px",
                  borderRadius: "12px",
                  background: darkMode
                    ? "#0f172a"
                    : "#f9fafb"
                }}
              >
                {chatMessages.map((msg, index) => (

                  <div
                    key={index}
                    style={{
                      textAlign:
                        msg.sender === "user"
                          ? "right"
                          : "left",

                      marginBottom: "10px"
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        borderRadius: "12px",

                        background:
                          msg.sender === "user"
                            ? "#4f6df5"
                            : darkMode
                              ? "#1e293b"
                              : "#e5e7eb",

                        color:
                          msg.sender === "user"
                            ? "#fff"
                            : darkMode
                              ? "#fff"
                              : "#111"
                      }}
                    >
                      {msg.text}
                    </span>
                  </div>

                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px"
                }}
              >
                <input
                  value={userInput}
                  onChange={(e) =>
                    setUserInput(e.target.value)
                  }
                  placeholder="Ask about spending, savings, risk..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db"
                  }}
                />

                <button
                  onClick={handleSendMessage}
                  style={{
                    background: "#4f6df5",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Send
                </button>
              </div>
            </div>

            {/* ACTION PLAN */}

            {
              savedActions.length > 0
              &&

              (

                <div
                  className="card"

                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3>

                    Action Plan

                  </h3>

                  <p
                    style={{
                      color: "#6b7280"
                    }}
                  >

                    Recommendations you accepted

                  </p>


                  <div
                    style={{

                      display: "grid",

                      gap: "12px",

                      marginTop: "20px"

                    }}
                  >

                    {
                      savedActions.map(
                        (
                          item,
                          index
                        ) => (

                          <div

                            key={index}

                            style={{

                              padding: "14px",

                              borderRadius: "12px",

                              background:
                                darkMode
                                  ?
                                  "#1e293b"
                                  :
                                  "#f8fafc"

                            }}
                          >

                            ✓ {item}

                          </div>

                        ))

                    }

                  </div>

                </div>

              )
            }
            {
              showCoach && (

                <div
                  style={{
                    marginTop: "30px",

                    background:
                      darkMode
                        ?
                        "linear-gradient(145deg,#071226,#0f172a)"
                        :
                        "#ffffff",

                    padding: "32px",

                    borderRadius: "30px",

                    boxShadow:
                      "0 20px 60px rgba(0,0,0,.25)",

                    border:
                      "1px solid rgba(79,109,245,.15)"
                  }}
                >

                  {/* HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >

                    <div>

                      <h2
                        style={{
                          margin: 0
                        }}
                      >
                        🤖 AI Financial Coach
                      </h2>

                      <div
                        style={{
                          color: "#94a3b8",
                          marginTop: "6px"
                        }}
                      >
                        AI Behavioral Spending Analysis
                      </div>
                      <div
                        style={{
                          padding: "10px 16px",

                          borderRadius: "14px",

                          background:
                            riskLevel === "High"
                              ?
                              "rgba(239,68,68,.12)"
                              :
                              riskLevel === "Medium"
                                ?
                                "rgba(245,158,11,.12)"
                                :
                                "rgba(34,197,94,.12)",

                          fontWeight: "700"
                        }}
                      >

                        {
                          riskLevel === "High"
                            ?
                            "⚠ Intervention Needed"

                            :
                            riskLevel === "Medium"
                              ?
                              "🟡 Monitor Spending"

                              :
                              "🟢 Financially Stable"

                        }

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        setShowCoach(false)
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#94a3b8"
                      }}
                    >
                      ×
                    </button>

                  </div>


                  {/* SCORE */}

                  <div
                    style={{
                      marginTop: "25px",

                      padding: "18px",

                      borderRadius: "18px",

                      background:
                        disciplineScore >= 80
                          ?
                          "rgba(34,197,94,.12)"
                          :
                          "rgba(239,68,68,.12)"
                    }}
                  >

                    <div
                      style={{
                        fontWeight: "700"
                      }}
                    >
                      Financial Discipline Score
                    </div>

                    <div
                      style={{
                        fontSize: "42px",
                        fontWeight: "800",
                        marginTop: "8px"
                      }}
                    >
                      {disciplineScore}
                    </div>

                  </div>


                  {/* MESSAGE */}

                  <div
                    style={{
                      marginTop: "24px"
                    }}
                  >

                    <h3>
                      AI Financial Diagnosis
                    </h3>


                    {/* GRID */}

                    <div
                      style={{
                        display: "grid",

                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(280px,1fr))",

                        gap: "18px",

                        marginTop: "18px"
                      }}
                    >


                      {/* ISSUE */}

                      <div
                        style={{
                          padding: "20px",

                          borderRadius: "18px",

                          background:
                            darkMode
                              ?
                              "#111827"
                              :
                              "#f8fafc"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#94a3b8"
                          }}
                        >
                          Detected Issue
                        </div>

                        <h2>
                          {
                            wantPercent > 50
                              ?
                              "High Lifestyle Spend"

                              :
                              projectedSpend > totalSpend
                                ?
                                "Budget Drift"

                                :
                                "Healthy Pattern"
                          }
                        </h2>

                        <p>

                          {
                            wantPercent > 50
                              ?
                              `₹${needWantTotals.Want} goes to wants.`

                              :
                              `Projected monthly spend ₹${projectedSpend}`
                          }

                        </p>

                      </div>



                      {/* ROOT CAUSE */}

                      <div
                        style={{
                          padding: "20px",

                          borderRadius: "18px",

                          background:
                            darkMode
                              ?
                              "#111827"
                              :
                              "#f8fafc"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#94a3b8"
                          }}
                        >
                          Root Cause
                        </div>

                        <h2>

                          {
                            smallTransactions > 15

                              ?

                              "Micro Spending"

                              :

                              topCategory?.name

                          }

                        </h2>

                        <p>

                          {
                            smallTransactions > 15

                              ?

                              `${smallTransactions} small purchases detected`

                              :

                              `Most money goes into ${topCategory?.name}`

                          }

                        </p>

                      </div>



                      {/* RECOVERY */}

                      <div
                        style={{
                          padding: "20px",

                          borderRadius: "18px",

                          background:
                            darkMode
                              ?
                              "#111827"
                              :
                              "#f8fafc"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#94a3b8"
                          }}
                        >
                          Recovery Strategy
                        </div>

                        <h2>

                          Save ₹{savingsPotential}

                        </h2>

                        <p>

                          Reduce daily spending to

                          ₹{Math.round(
                            dailyBurnRate * .85
                          )}

                        </p>

                      </div>

                    </div>



                    {/* ACTIONS */}

                    <div
                      style={{
                        marginTop: "24px"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "18px"
                        }}
                      >

                        <h3>
                          Recommended Improvements
                        </h3>


                        <select
                          value={coachMode}

                          onChange={
                            (e) =>
                              setCoachMode(
                                e.target.value
                              )
                          }

                          style={{
                            padding: "10px 14px",

                            borderRadius: "12px",

                            background:
                              darkMode
                                ?
                                "#111827"
                                :
                                "#ffffff",

                            color:
                              darkMode
                                ?
                                "#ffffff"
                                :
                                "#111827",

                            border:
                              "1px solid rgba(255,255,255,.1)"
                          }}
                        >

                          <option value="aggressive">
                            Aggressive Saving
                          </option>

                          <option value="balanced">
                            Balanced
                          </option>

                          <option value="comfort">
                            Lifestyle Comfort
                          </option>

                        </select>

                      </div>


                      <div
                        style={{
                          display: "grid",

                          gap: "12px",

                          marginTop: "14px"
                        }}
                      >

                        {
                          coachStrategies[coachMode]?.map((tip) => (

                            <div
                              key={tip}

                              style={{
                                padding: "16px",
                                borderRadius: "14px",
                                background:
                                  darkMode
                                    ?
                                    "#0f172a"
                                    :
                                    "#f8fafc",

                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >

                              <div>
                                🎯 {tip}
                              </div>

                              <button
                                style={{
                                  padding: "8px 14px",
                                  border: "none",
                                  borderRadius: "10px",
                                  background: "#4f6df5",
                                  color: "#fff"
                                }}
                              >
                                Apply
                              </button>

                            </div>

                          ))
                        }

                      </div>


                      {/* BUDGET RECOVERY SIMULATOR */}

                      <div
                        style={{
                          marginTop: "28px",

                          padding: "22px",

                          borderRadius: "18px",

                          background:
                            darkMode
                              ?
                              "#111827"
                              :
                              "#f8fafc"
                        }}
                      >

                        <h3>
                          Budget Recovery Simulator
                        </h3>

                        <p>

                          Reduce discretionary spending:

                          <strong>
                            {reduction}%
                          </strong>

                        </p>

                        <input

                          type="range"

                          min="0"

                          max="50"

                          value={reduction}

                          onChange={(e) =>
                            setReduction(
                              Number(
                                e.target.value
                              )
                            )
                          }

                          style={{
                            width: "100%"
                          }}

                        />

                        <div
                          style={{
                            marginTop: "18px",

                            display: "grid",

                            gridTemplateColumns:
                              "repeat(2,1fr)",

                            gap: "14px"
                          }}
                        >

                          <div>

                            Projected Savings

                            <h2>
                              ₹{simulatedSavings}
                            </h2>

                          </div>

                          <div>

                            New Daily Limit

                            <h2>
                              ₹{dailyLimit}
                            </h2>

                          </div>

                          <div>

                            Discipline Score

                            <h2>
                              {projectedDiscipline}/100
                            </h2>

                          </div>

                          <div>

                            Recovery Days

                            <h2>
                              {recoveryDays}
                            </h2>

                          </div>

                        </div>

                      </div>

                      {/* FUTURE */}

                      <div
                        style={{
                          marginTop: "28px",

                          padding: "20px",

                          borderRadius: "18px",

                          background:
                            "linear-gradient(90deg,#4f6df520,#22c55e20)"
                        }}
                      >

                        <div
                          style={{
                            fontWeight: "700"
                          }}
                        >

                          Forecast After Improvement

                        </div>

                        <div
                          style={{
                            marginTop: "12px",

                            lineHeight: "2"
                          }}
                        >

                          Expected Savings:

                          ₹{savingsPotential}

                          <br />

                          Expected Discipline:

                          {Math.min(
                            100,
                            disciplineScore + 8
                          )}/100

                          <br />

                          Expected Recovery:

                          14–21 days

                        </div>

                      </div>

                      {/* SAVINGS */}
                      <div
                        style={{
                          display: "grid",

                          gridTemplateColumns:
                            "repeat(auto-fit,minmax(220px,1fr))",

                          gap: "18px",

                          marginTop: "25px"
                        }}
                      >

                        <div
                          style={{
                            padding: "18px",
                            borderRadius: "18px",
                            background: "#22c55e20"
                          }}
                        >

                          <div>Potential Monthly Savings</div>

                          <h2>
                            ₹{savingsPotential}
                          </h2>

                        </div>


                        <div
                          style={{
                            padding: "18px",
                            borderRadius: "18px",
                            background: "#4f6df520"
                          }}
                        >

                          <div>Projected Spend</div>

                          <h2>
                            ₹{projectedSpend}
                          </h2>

                        </div>

                      </div>


                      {/* PROGRESS */}

                      <div
                        style={{
                          marginTop: "28px"
                        }}
                      >

                        <div
                          style={{
                            marginBottom: "8px"
                          }}
                        >
                          Financial Recovery Progress
                        </div>

                        <div
                          style={{
                            height: "14px",

                            background: "#1e293b",

                            borderRadius: "20px"
                          }}
                        >

                          <div
                            style={{
                              height: "100%",

                              width:
                                `${disciplineScore}%`,

                              borderRadius: "20px",

                              background:
                                disciplineScore > 80
                                  ?
                                  "#22c55e"
                                  :
                                  disciplineScore > 60
                                    ?
                                    "#f59e0b"
                                    :
                                    "#ef4444",

                              transition:
                                "all .8s"
                            }}
                          />

                        </div>

                      </div>


                      {/* NEXT ACTION */}

                      <div
                        style={{
                          marginTop: "28px",

                          padding: "20px",

                          borderRadius: "18px",

                          background:
                            "rgba(79,109,245,.12)"
                        }}
                      >

                        <div
                          style={{
                            fontWeight: "700"
                          }}
                        >
                          Next Recommended Action
                        </div>

                        <div
                          style={{
                            marginTop: "8px"
                          }}
                        >
                          {
                            disciplineScore > 80
                              ?

                              "Increase monthly investments"

                              :

                              disciplineScore > 60
                                ?

                                "Reduce wants by 10%"

                                :

                                "Freeze discretionary spending for 5 days"

                          }

                        </div> {/* Next Action */}

                      </div> {/* ACTIONS */}

                    </div> {/* MESSAGE */}

                  </div> {/* showCoach main container */}

                  {/* INSIGHTS LIST */}
                  <div className="card" style={{ marginTop: "20px" }}>
                    <h3>Detailed Insights</h3>
                    <div style={{ marginBottom: "15px" }}>

                      {needPercent >= 70 && (
                        <p>
                          ✅ Excellent financial discipline detected.
                        </p>
                      )}

                      {wantPercent >= 50 && (
                        <p>
                          ⚠️ High discretionary spending detected.
                        </p>
                      )}

                      {disciplineScore < 60 && (
                        <p>
                          🚨 Your financial discipline score is low.
                        </p>
                      )}

                      {disciplineScore >= 80 && (
                        <p>
                          💡 Your spending behavior appears balanced.
                        </p>
                      )}

                    </div>

                    {(insights || []).length > 0 ? (
                      (insights || []).map((i, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            background: darkMode ? "#1f2937" : "#f9fafb"
                          }}
                        >
                          {i}
                        </div>
                      ))
                    ) : (
                      <p>No insights available</p>
                    )}
                  </div>

                </div>

              );
            }
            export default InsightsPage;