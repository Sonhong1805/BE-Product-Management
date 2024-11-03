const mongoose = require("mongoose");
const { Schema } = mongoose;
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const categorySchema = new Schema(
  {
    title: String,
    slug: { type: String, slug: "title", unique: true },
    parent_slug: {
      type: String,
      default: "",
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
    ],
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

module.exports = mongoose.model("category", categorySchema);
