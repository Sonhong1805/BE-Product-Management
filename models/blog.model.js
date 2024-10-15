const mongoose = require("mongoose");
const { Schema } = mongoose;
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const blogSchema = new Schema(
  {
    title: String,
    slug: { type: String, slug: "title", unique: true },
    thumbnail: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    author: String,
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

module.exports = mongoose.model("blog", blogSchema);
