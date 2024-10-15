const asyncHandler = require("express-async-handler");
const settingModel = require("../models/setting.model");

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
}

module.exports = new SettingsController();
