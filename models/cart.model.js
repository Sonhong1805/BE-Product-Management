const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    products: [
      {
        title: String,
        slug: String,
        thumbnail: String,
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
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("cart", cartSchema);
