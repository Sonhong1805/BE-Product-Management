const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    products: [
      {
        title: String,
        slug: String,
        thumbnail: String,
        price: Number,
        discountedPrice: Number,
        quantity: Number,
        maxQuantity: Number,
        productId: String,
        variant: String,
        selected: Boolean,
      },
    ],
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("cart", cartSchema);
