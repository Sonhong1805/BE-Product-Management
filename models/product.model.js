const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: String,
    slug: { type: String, slug: "title", unique: true },
    description: {
      type: String,
      default: "",
    },
    label: {
      type: {
        label: String,
        value: String,
      },
      default: null,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    images: {
      type: Array,
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    price: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    descriptions: String,
    tags: [
      {
        value: String,
        label: String,
      },
    ],
    colors: [
      {
        value: String,
        label: String,
        color: String,
      },
    ],
    quantity: {
      type: Number,
      default: 1,
    },
    sold: {
      type: Number,
      default: 0,
    },
    variants: [
      {
        name: {
          type: String,
          default: "",
        },
        thumbnail: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          default: 0,
        },
        discount: {
          type: Number,
          default: 0,
        },
        discountedPrice: {
          type: Number,
          default: 0,
        },
        status: {
          type: Boolean,
          default: true,
        },
        deleted: {
          type: Boolean,
          default: false,
        },
        createdAt: Date,
        updatedAt: Date,
      },
    ],
    ratings: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "user" },
          content: String,
          star: Number,
          createdAt: {
            type: Date,
            default: Date,
          },
        },
      ],
      default: [],
    },
    status: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model("product", productSchema);
