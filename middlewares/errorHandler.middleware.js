const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy route ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(status).json({
    success: false,
    message: error?.message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
