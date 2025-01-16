const asyncHandler = require("express-async-handler");
const productModel = require("../models/product.model");
const convertDiscountedPrice = require("../helpers/discountedPrice");

class VariantsController {
  index = asyncHandler(async (req, res) => {
    const { pSlug } = req.params;
    const response = await productModel
      .findOne({ slug: pSlug })
      .select("variants")
      .lean();
    if (response && response.variants) {
      response.variants.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    }

    res.status(200).json({
      success: true,
      message: "Danh sách phân loại sản phẩm",
      data: response?.variants || [],
    });
  });

  create = asyncHandler(async (req, res) => {
    const { pSlug } = req.params;
    const { name, price, discount, status } = req.body;
    const thumbnail = req?.file?.path || req.body.thumbnail;
    const discountedPrice = convertDiscountedPrice(price, discount);
    const response = await productModel.findOneAndUpdate(
      { slug: pSlug },
      {
        $push: {
          variants: {
            name,
            thumbnail,
            price,
            discount,
            discountedPrice,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (response) {
      const newVariant = response.variants[response.variants.length - 1];
      res.status(200).json({
        success: true,
        message: "Tạo mới thành công",
        data: newVariant,
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { pSlug, vid } = req.params;
    const { name, price, discount, status } = req.body;
    const thumbnail = req?.file?.path || req.body.thumbnail;
    const discountedPrice = convertDiscountedPrice(price, discount);
    const response = await productModel.findOneAndUpdate(
      { slug: pSlug, "variants._id": vid },
      {
        $set: {
          "variants.$.name": name,
          "variants.$.thumbnail": thumbnail,
          "variants.$.price": price,
          "variants.$.discount": discount,
          "variants.$.discountedPrice": discountedPrice,
          "variants.$.status": status,
          "variants.$.updatedAt": new Date(),
        },
      },
      { new: true }
    );
    if (response) {
      const updateVariant = response.variants.find(
        (variant) => variant._id.toString() === vid
      );
      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: updateVariant,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { pSlug, vid } = req.params;
    const response = await productModel.findOneAndUpdate(
      { slug: pSlug },
      {
        $pull: { variants: { _id: vid } },
      },
      { new: true }
    );
    if (response) {
      res.status(200).json({
        success: true,
        message: "Xoá thành công",
        data: {
          _id: vid,
        },
      });
    }
  });
}

module.exports = new VariantsController();
