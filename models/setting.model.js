const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema(
  {
    name: String,
    logo: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    copyright: {
      type: String,
      default: "",
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("setting", settingSchema);
