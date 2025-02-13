const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const forgotPasswordModel = require("../models/forgotPassword");
const { sendMail } = require("../helpers/sendMail");
const { generateRandomNumber } = require("../helpers/generator");
const bcrypt = require("bcryptjs");

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const response = await userModel.findOne({ email }).populate("role cart");

    if (response && (await response.isCorrectPassword(password))) {
      const {
        password,
        deleted,
        status,
        createdAt,
        updatedAt,
        refreshToken,
        ...user
      } = response.toObject();
      const accessToken = this.createAccessToken(user);
      const newRefreshToken = this.createRefreshToken(user);
      await userModel.findByIdAndUpdate(user._id, {
        refreshToken: newRefreshToken,
      });
      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: ms(process.env.JWT_REFRESH_EXPIRE),
      });
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          accessToken,
          user,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Đăng nhập thất bại !!!",
        data: {
          accessToken,
          user,
        },
      });
    }
  });

  register = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;
    const response = await userModel.create({ fullname, email, password });
    if (response) {
      return res.status(200).json({
        success: true,
        message: "Đăng ký thành công",
      });
    }
  });

  account = asyncHandler(async (req, res) => {
    const user = req.user;
    const response = await userModel
      .findById(user._id)
      .populate("role cart")
      .select("-refreshToken -password");
    return res.status(200).json({
      success: true,
      message: "Thông tin tài khoản",
      data: {
        user: response,
      },
    });
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshTokenCookie = req.cookies["refresh_token"];
    jwt.verify(
      refreshTokenCookie,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (error, data) => {
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Token không hợp lệ",
          });
        }
      }
    );

    const response = await userModel.findOne({
      refreshToken: refreshTokenCookie,
    });

    if (response) {
      const {
        password,
        deleted,
        status,
        createdAt,
        updatedAt,
        refreshToken,
        ...user
      } = response.toObject();

      const accessToken = this.createAccessToken(user);
      const newRefreshToken = this.createRefreshToken(user);
      await userModel.findByIdAndUpdate(user._id, {
        refreshToken: newRefreshToken,
      });
      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: ms(process.env.JWT_REFRESH_EXPIRE),
      });
      return res.status(200).json({
        success: true,
        message: "Refresh token thành công",
        data: {
          accessToken,
          user,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Refresh token thất bại",
      });
    }
  });

  logout = asyncHandler(async (req, res) => {
    const user = req.user;
    await userModel.findByIdAndUpdate(
      { _id: user._id },
      {
        refreshToken: "",
      }
    );
    res.clearCookie("refresh_token");
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email, deleted: false });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy địa chỉ Email",
      });
    }

    const isExits = await forgotPasswordModel.findOne({ email });
    if (isExits) {
      await forgotPasswordModel.findOneAndDelete({ email });
    }
    const otp = generateRandomNumber(6);
    await forgotPasswordModel.create({ email, otp });

    sendMail(email, otp);
    res.status(200).json({
      success: true,
      message: "Gửi mã OTP thành công",
    });
  });

  otpPassword = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const isExistOTP = await forgotPasswordModel.findOne({ email, otp });
    if (isExistOTP) {
      return res.status(200).json({
        success: true,
        message: "Xác thực OTP thành công",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Xác thực OTP không thành công",
      });
    }
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const newPassword = await bcrypt.hash(password, salt);
    await userModel.updateOne({ email }, { password: newPassword });
    return res.status(200).json({
      success: true,
      message: "Thay đổi mật khẩu thành công",
    });
  });

  createAccessToken(payload) {
    const access_token = jwt.sign(
      payload,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
      }
    );
    return access_token;
  }
  createRefreshToken(payload) {
    const refresh_token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
      }
    );
    return refresh_token;
  }
}

module.exports = new AuthController();
