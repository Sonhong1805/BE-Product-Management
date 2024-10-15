const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    fullname: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "role",
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "cart",
    },
    wishlist: {
      type: [
        {
          slug: String,
          title: String,
          thumbnail: String,
          price: Number,
          discount: Number,
          discountedPrice: Number,
        },
      ],
      default: [],
    },
    refreshToken: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
};

module.exports = mongoose.model("user", userSchema);
