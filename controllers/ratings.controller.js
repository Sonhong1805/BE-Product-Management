const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const productModel = require("../models/product.model");

class RatingsController {
  create = asyncHandler(async (req, res) => {
    const user = req.user;
    const { pid } = req.params;
    const { content, star } = req.body;

    const newRatingItem = {
      _id: new mongoose.mongo.ObjectId(),
      user: new mongoose.mongo.ObjectId(user._id),
      content,
      star,
      createdAt: new Date(),
    };

    await productModel.updateOne(
      {
        _id: pid,
      },
      {
        $push: {
          ratings: {
            $each: [newRatingItem],
            $position: 0,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Thêm đánh giá thành công",
      data: {
        ...newRatingItem,
        user: {
          _id: user._id,
          fullname: user.fullname,
          avatar: user.avatar,
        },
      },
    });
  });
}

module.exports = new RatingsController();
