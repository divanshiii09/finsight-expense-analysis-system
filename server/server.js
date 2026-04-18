const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

/* ✅ CREATE APP */
const app = express();

/* ✅ MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ✅ TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

/* ✅ CONNECT DATABASE (LOCAL) */
mongoose.connect("mongodb://127.0.0.1:27017/financeDB")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error ❌:", err));

/* ============================
   ✅ AUTH SCHEMA (LOGIN/REGISTER)
============================ */
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

/* ============================
   ✅ REGISTER API
============================ */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.json({
      success: true,
      message: "User registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ============================
   ✅ LOGIN API
============================ */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (user) {
      res.json({
        success: true,
        message: "Login successful"
      });
    } else {
      res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ============================
   ✅ USER DATA SCHEMA
============================ */
const userDataSchema = new mongoose.Schema({
  incomeCategory: String,
  questionnaire: Object,
  spendingPriority: Object,
  budgetLimits: Object
}, { timestamps: true });

const UserData = mongoose.model("UserData", userDataSchema);

/* ============================
   ✅ SAVE USER DATA API
============================ */
app.post("/api/userdata/save", async (req, res) => {
  try {
    console.log("📥 FULL BODY:", req.body);

    const data = new UserData(req.body);
    await data.save();

    console.log("✅ SAVED SUCCESSFULLY");

    res.json({
      success: true,
      message: "Data saved successfully!"
    });

  } catch (err) {
    console.error("❌ ERROR DETAILS:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ============================
   ✅ START SERVER
============================ */
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});