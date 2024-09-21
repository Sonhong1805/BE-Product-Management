const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connection successfully");
  } catch (error) {
    console.log("database connection error");
  }
};

module.exports = { connect };
