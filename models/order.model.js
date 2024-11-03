const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: String,
    fullname: String,
    email: String,
    phone: String,
    address: String,
    method: {
      type: String,
      enum: ["CASH", "PAYPAL"],
      default: "CASH",
    },
    status: {
      type: String,
      enum: ["APPROVED", "PENDING", "CANCELED"],
      default: "PENDING",
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    products: [
      {
        title: String,
        slug: String,
        thumbnail: String,
        price: Number,
        discountedPrice: Number,
        quantity: Number,
        productId: String,
        variant: String,
        selected: {
          type: Boolean,
          default: false,
        },
      },
    ],
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

module.exports = mongoose.model("order", orderSchema);
