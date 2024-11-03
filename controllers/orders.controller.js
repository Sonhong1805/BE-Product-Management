const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");

class OrdersController {
  index = asyncHandler(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.deleted = false;

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = orderModel.find(JSON.parse(queryString));

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-updatedAt");
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 2;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const [orders, totalItems] = await Promise.all([
      query.exec(),
      orderModel.find(JSON.parse(queryString)).countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      message: "Danh sách đơn hàng",
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      data: orders,
    });
  });

  detailByUserId = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const response = await orderModel.find({ userId: uid });
    if (response) {
      res.status(200).json({
        success: true,
        message: "Chi tiết toàn bộ đơn hàng của khách hàng",
        data: response,
      });
    }
  });

  detail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await orderModel.find(id);
    if (response) {
      res.status(200).json({
        success: true,
        message: "Chi tiết 1 đơn hàng của khách hàng",
        data: response,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const user = req.user;
    const { cid } = req.params;
    const { fullname, email, phone, address, method, products } = req.body;
    const ids = products.map(
      (product) => new mongoose.mongo.ObjectId(product._id)
    );
    const totalPrice = products.reduce(
      (sum, product) => (sum += product.discountedPrice * product.quantity),
      0
    );
    const response = await orderModel.create({
      userId: user._id,
      fullname,
      email,
      phone,
      address,
      method,
      products,
      totalPrice,
    });
    if (response) {
      await cartModel.findByIdAndUpdate(cid, {
        $pull: { products: { _id: { $in: ids } } },
      });
      return res.status(200).json({
        success: true,
        message: "Đặt hàng thành công",
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const response = await orderModel.findByIdAndUpdate(id, { status });
    if (response) {
      res.status(200).json({
        success: true,
        message: "Cập nhật đơn hàng thành công",
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await orderModel.findByIdAndUpdate(id, { deleted: true });
    if (response) {
      res.status(200).json({
        success: true,
        message: "Xoá đơn hàng thành công",
      });
    }
  });

  changeFeature = asyncHandler(async (req, res) => {
    const { ids, feature } = req.body;
    const field = feature.split("-")[0];
    const value = feature.split("-")[1];
    const response = await orderModel.updateMany(
      { _id: { $in: ids } },
      { $set: { [field]: value } },
      { multi: true }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Áp dụng thành công",
        data: response,
      });
    }
  });
}

module.exports = new OrdersController();
