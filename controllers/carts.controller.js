const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cart.model");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");

class cartsController {
  create = asyncHandler(async (req, res) => {
    const user = req.user;
    const {
      cartId,
      productId,
      variant,
      title,
      slug,
      thumbnail,
      price,
      discountedPrice,
      quantity,
      selected,
    } = req.body;

    if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
      const response = await cartModel.findOneAndUpdate(
        {},
        {
          $push: {
            products: {
              $each: [
                {
                  _id: new mongoose.mongo.ObjectId(),
                  productId,
                  title,
                  slug,
                  thumbnail,
                  price,
                  discountedPrice,
                  quantity,
                  variant,
                  selected,
                },
              ],
              $position: 0,
            },
          },
        },
        { new: true, upsert: true }
      );
      const newCart = await userModel
        .findByIdAndUpdate(
          user._id,
          {
            cart: response._id,
          },
          { new: true }
        )
        .populate("cart")
        .select("cart");
      if (newCart) {
        return res.status(200).json({
          success: true,
          message: "Thêm vào giỏ hàng thành công",
          data: newCart.cart,
        });
      }
    } else {
      const isExistCart = await cartModel.findOne({ _id: cartId });
      if (isExistCart) {
        const isExistProduct = isExistCart.products.find(
          (product) =>
            product.productId === productId && product.variant === variant
        );
        if (isExistProduct) {
          const newQuantity = quantity + isExistProduct.quantity;
          await cartModel.updateOne(
            {
              _id: cartId,
              "products.productId": productId,
              "products.variant": variant,
            },
            {
              "products.$.quantity": newQuantity,
            }
          );
          const updateCart = await userModel
            .findById(user._id)
            .populate("cart")
            .select("cart");
          if (updateCart) {
            return res.status(200).json({
              success: true,
              message: "Thêm vào giỏ hàng thành công",
              data: updateCart.cart,
            });
          }
        } else {
          await cartModel.updateOne(
            {
              _id: cartId,
            },
            {
              $push: {
                products: {
                  $each: [
                    {
                      _id: new mongoose.mongo.ObjectId(),
                      productId,
                      title,
                      slug,
                      thumbnail,
                      price,
                      discountedPrice,
                      quantity,
                      variant,
                      selected,
                    },
                  ],
                  $position: 0,
                },
              },
            },
            { new: true, upsert: true }
          );
          const updateCart = await userModel
            .findById(user._id)
            .populate("cart")
            .select("cart");
          if (updateCart) {
            return res.status(200).json({
              success: true,
              message: "Thêm vào giỏ hàng thành công",
              data: updateCart.cart,
            });
          }
        }
      }
    }
  });

  update = asyncHandler(async (req, res) => {
    const { cid, id } = req.params;
    const { type } = req.body;

    const response = await cartModel.findOne({ _id: cid }).select("products");
    const products = response.products;
    const currentQuantity = products.find(
      (product) => product._id + "" === id
    ).quantity;

    switch (type) {
      case "plus": {
        const newQuantity = currentQuantity + 1;
        await cartModel.updateOne(
          {
            _id: cid,
            "products._id": new mongoose.Types.ObjectId(id),
          },
          {
            "products.$.quantity": newQuantity,
          }
        );
        return res.status(200).json({
          success: true,
          message: "Tăng số lượng thành công",
          data: {
            _id: id,
            quantity: newQuantity,
          },
        });
      }
      case "minus": {
        let newQuantity = currentQuantity - 1;
        if (newQuantity <= 1) {
          newQuantity = 1;
        }
        await cartModel.updateOne(
          {
            _id: cid,
            "products._id": new mongoose.Types.ObjectId(id),
          },
          {
            "products.$.quantity": newQuantity,
          }
        );
        return res.status(200).json({
          success: true,
          message: "Giảm số lượng thành công",
          data: {
            _id: id,
            quantity: newQuantity,
          },
        });
      }
      default:
        return res.status(400).json({
          success: false,
          message: "Cập nhật thất bại",
        });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { cid, id } = req.params;

    await cartModel.updateOne(
      { _id: cid },
      { $pull: { products: { _id: new mongoose.Types.ObjectId(id) } } }
    );

    return res.status(200).json({
      success: true,
      message: "Xoá sản phẩm khỏi giỏ hàng thành công",
    });
  });

  selected = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const { selectedIds, type } = req.body;

    const objectIdSelectedIds = selectedIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    switch (type) {
      case "change": {
        await cartModel.updateOne(
          { _id: cid },
          {
            $set: {
              "products.$[selectedTrue].selected": true,
              "products.$[selectedFalse].selected": false,
            },
          },
          {
            arrayFilters: [
              { "selectedTrue._id": { $in: objectIdSelectedIds } },
              { "selectedFalse._id": { $nin: objectIdSelectedIds } },
            ],
          }
        );

        return res.status(200).json({
          success: true,
          message: "Cập nhật trạng thái thành công",
        });
      }
      case "delete": {
        await cartModel.updateOne(
          { _id: cid },
          {
            $pull: { products: { _id: { $in: objectIdSelectedIds } } },
          }
        );
        return res.status(200).json({
          success: true,
          message: "Xoá sản phẩm thành công",
        });
      }
      default: {
        return res.status(400).json({
          success: false,
          message: "Cập nhật thất bại",
        });
      }
    }
  });
}

module.exports = new cartsController();
