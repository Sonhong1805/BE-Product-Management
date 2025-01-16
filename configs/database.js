const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connection successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

module.exports = { connect };
