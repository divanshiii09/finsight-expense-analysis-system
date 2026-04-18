// createUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/finsight")
  .then(async () => {
    const existing = await User.findOne({ email: "test@example.com" });
    if (existing) {
      console.log("Test user already exists");
      mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash("123456", 10);
    await User.create({ name: "Test User", email: "test@example.com", password: hashedPassword });
    console.log("Test user created successfully");
    mongoose.disconnect();
  })
  .catch(err => console.error(err));