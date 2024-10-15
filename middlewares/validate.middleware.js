const userModel = require("../models/user.model");

module.exports.inputsRegister = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  if (!fullname) {
    return res.status(400).json({
      success: false,
      message: "Họ tên không được bỏ trống",
    });
  }
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email không được bỏ trống",
    });
  }
  const isExistEmail = await userModel.findOne({ email });
  if (isExistEmail) {
    return next(new Error("Email đã tồn tại"));
  }
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu không được bỏ trống",
    });
  }
  next();
};

module.exports.inputsLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email không được bỏ trống",
    });
  }
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu không được bỏ trống",
    });
  }
  next();
};
