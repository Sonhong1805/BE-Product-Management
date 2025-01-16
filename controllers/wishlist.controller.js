const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");

class WishlistController {
  create = asyncHandler(async (req, res) => {
    const user = req.user;
    const { slug, title, thumbnail, price, discount, discountedPrice } =
      req.body;
    const newWishlistItem = {
      _id: new mongoose.mongo.ObjectId(),
      slug,
      title,
      thumbnail,
      price,
      discount,
      discountedPrice,
    };

    await userModel.updateOne(
      {
        _id: user._id,
      },
      {
        $push: {
          wishlist: {
            $each: [newWishlistItem],
            $position: 0,
          },
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Yêu thích sản phẩm thành công",
      data: newWishlistItem,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    await userModel.updateOne(
      {
        _id: user._id,
      },
      {
        $pull: {
          wishlist: {
            _id: new mongoose.mongo.ObjectId(id),
          },
        },
      }
    );
    res.status(200).json({
      success: true,
      message: "Bỏ yêu thích thành công",
      data: {
        _id: id,
      },
    });
  });
}

module.exports = new WishlistController();
