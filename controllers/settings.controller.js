const asyncHandler = require("express-async-handler");
const settingModel = require("../models/setting.model");
const productModel = require("../models/product.model");
const categoryModel = require("../models/category.model");
const orderModel = require("../models/order.model");
const contactModel = require("../models/contact.model");

class SettingsController {
  index = asyncHandler(async (req, res) => {
    const settings = await settingModel.findOne({});
    res.status(200).json({
      success: true,
      message: "Cài đặt chung",
      data: settings,
    });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, address, copyright } = req.body;
    const logo = req?.file?.path || req.body.logo;

    const response = await settingModel.findByIdAndUpdate(
      { _id: id },
      { name, logo, phone, email, address, copyright },
      { new: true }
    );
    if (response) {
      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: response,
      });
    }
  });

  dashboard = asyncHandler(async (req, res) => {
    const [products, categories, orders, contacts] = await Promise.all([
      productModel.find({}),
      categoryModel.find({}),
      orderModel.find({}),
      contactModel.find({}),
    ]);

    const data = {
      products: {
        total: products.length,
        active: products.filter((product) => !product.deleted).length,
        inactive: products.filter((product) => product.deleted).length,
      },
      categories: {
        total: categories.length,
        active: categories.filter((category) => !category.deleted).length,
        inactive: categories.filter((category) => category.deleted).length,
      },
      orders: {
        total: orders.length,
        approved: orders.filter((order) => order.status === "APPROVED").length,
        pending: orders.filter((order) => order.status === "PENDING").length,
      },
      contacts: {
        total: contacts.length,
        active: contacts.filter((order) => order.status).length,
        inactive: contacts.filter((order) => !order.status).length,
      },
    };

    res.status(200).json({
      success: true,
      message: "Thông tin trang tổng quan",
      data,
    });
  });
}

module.exports = new SettingsController();
