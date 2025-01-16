const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connection successfully");
  } catch (error) {
    console.log("database connection error");
  }
};

module.exports = { connect };
