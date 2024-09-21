const asyncHandler = require("express-async-handler");
const userModel = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const ms = require("ms");

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const response = await userModel.findOne({ email });

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
        success: !!response,
        message: "Đăng nhập thành công",
        data: {
          accessToken,
          user,
        },
      });
    } else {
      throw new Error("Đăng nhập thất bại !!!");
    }
  });

  register = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;
    const response = await userModel.create({ fullname, email, password });
    return res.status(200).json({
      success: !!response,
      message: "Đăng ký thành công",
    });
  });

  account = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json({
      success: !!user,
      message: "Thông tin tài khoản",
      data: {
        user,
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
        success: !!response,
        message: "Refresh token thành công",
        data: {
          accessToken,
          user,
        },
      });
    } else {
      throw new Error("Refresh token thất bại");
    }
  });

  logout(req, res) {}
  forgotPassword(req, res) {}
  resetPassword(req, res) {}

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
