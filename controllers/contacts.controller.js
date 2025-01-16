const asyncHandler = require("express-async-handler");
const contactModel = require("../models/contact.model");
const { answersContact } = require("../helpers/answersContact");

class ContactsController {
  index = asyncHandler(async (req, res) => {
    const { keywords, status } = req.query;

    const query = {
      deleted: false,
    };

    if (keywords) {
      const regex = new RegExp(keywords, "i");
      query.$or = [{ fullName: regex }, { email: regex }, { topic: regex }];
    }

    if (status) {
      if (!query.$or) {
        query.$or = [{ status }];
      } else {
        query.$and = [{ $or: query.$or }, { status }];
        delete query.$or;
      }
    }

    const contacts = await contactModel.find(query).sort("-updatedAt");
    res.status(200).json({
      success: true,
      message: "Danh sách liên hệ",
      data: contacts,
    });
  });

  create = asyncHandler(async (req, res) => {
    const { fullName, email, topic, content } = req.body;
    const response = await contactModel.create({
      fullName,
      email,
      topic,
      content,
    });
    if (response) {
      res.status(200).json({
        success: true,
        message: "Gửi liên hệ thành công",
        data: response,
      });
    }
  });

  detail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await contactModel.findById(id);
    if (response) {
      res.status(200).json({
        success: true,
        message: "Chi tiết liên hệ",
        data: response,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await contactModel.findByIdAndUpdate(
      { _id: id },
      {
        deleted: true,
      }
    );

    if (response) {
      res.status(200).json({
        success: true,
        message: "Xoá liên hệ thành công",
        data: {
          _id: response._id,
        },
      });
    }
  });

  changeFeature = asyncHandler(async (req, res) => {
    const { ids, feature } = req.body;

    const field = feature.split("-")[0];
    const value = feature.split("-")[1];
    const response = await contactModel.updateMany(
      { _id: { $in: ids } },
      { $set: { [field]: value } },
      { multi: true }
    );

    if (response) {
      res.status(200).json({
        success: true,
        message: "Áp dụng thành công",
        data: response,
      });
    }
  });

  accept = asyncHandler(async (req, res) => {
    const { email, answers } = req.body;
    answersContact(email, answers);
    const response = await contactModel.findOneAndUpdate(
      {
        email,
      },
      {
        status: true,
      }
    );
    if (response) {
      res.status(200).json({
        success: true,
        message: "Đã gửi email trả lời",
      });
    }
  });
}

module.exports = new ContactsController();
