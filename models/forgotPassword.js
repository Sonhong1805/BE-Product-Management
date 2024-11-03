const mongoose = require("mongoose");
const { Schema } = mongoose;

const forgotPassword = new Schema(
  {
    email: String,
    otp: String,
    expireAt: {
      type: Date,
      expires: 180,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "forgot-password",
  forgotPassword,
  "forgot-password"
);
