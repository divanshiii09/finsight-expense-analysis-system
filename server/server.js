const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ✅ MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ✅ TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

/* ✅ DB CONNECT */
mongoose.connect("mongodb://127.0.0.1:27017/financeDB")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB error ❌", err));

/* ============================
   USER MODEL
============================ */
const User = mongoose.model("User", {
  email: String,
  password: String
});

/* ============================
   REGISTER
============================ */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    await User.create({ email, password });

    res.json({
      success: true,
      message: "Registered successfully",
      name: email.split("@")[0]
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================
   LOGIN
============================ */
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("LOGIN API HIT");

    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      name: email.split("@")[0]
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ✅ START SERVER */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});