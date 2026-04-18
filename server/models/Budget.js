const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  incomeCategory: String,
  questionnaire: Object,
  spendingPriorities: Object,
  budgetLimits: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Budget", BudgetSchema);