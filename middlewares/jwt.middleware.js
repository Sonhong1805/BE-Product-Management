const jwt = require("jsonwebtoken");

const authenticateJWT = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.refresh_token) {
    token = req.cookies.refresh_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không tồn tại",
    });
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (error, data) => {
    if (error) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
    req.user = data;
    next();
  });
};

module.exports = authenticateJWT;
