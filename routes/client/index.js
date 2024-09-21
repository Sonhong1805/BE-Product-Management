const authRoute = require("./auth.route");
const {
  notFound,
  errorHandler,
} = require("../../middlewares/errorHandler.middleware");

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/", (req, res) => {
    res.send("Home page");
  });
  app.use(notFound);
  app.use(errorHandler);
};
