const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    fullName: {
      type: String,
      default: "",
      required: true,
    },
    email: {
      type: String,
      default: "",
      required: true,
    },
    topic: {
      type: String,
      default: "",
      required: true,
    },
    content: {
      type: String,
      default: "",
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("contact", contactSchema);
