// models/UserData.js
const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema(
  {
    incomeType: { type: String, required: true },
    category: { type: String, required: true },
    questionnaire: { type: Object, required: true },
    spendingPriority: { type: Object },
    budgetLimits: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserData", UserDataSchema);