const {
  notFound,
  errorHandler,
} = require("../middlewares/errorHandler.middleware");
const authRoute = require("./auth.route");
const categoryRoute = require("./category.route");
const productRoute = require("./product.route");
const roleRoute = require("./role.route");
const accountRoute = require("./account.route");
const blogRoute = require("./blog.route");
const settingRoute = require("./setting.route");
const variantRoute = require("./variant.route");
const cartRoute = require("./cart.route");
const wishlistRoute = require("./wishlist.route");
const ratingRoute = require("./rating.route");
const orderRoute = require("./order.route");

module.exports = (app) => {
  app.use("/auth", authRoute);
  app.use("/categories", categoryRoute);
  app.use("/products", productRoute);
  app.use("/roles", roleRoute);
  app.use("/accounts", accountRoute);
  app.use("/blogs", blogRoute);
  app.use("/settings", settingRoute);
  app.use("/variants", variantRoute);
  app.use("/carts", cartRoute);
  app.use("/wishlist", wishlistRoute);
  app.use("/ratings", ratingRoute);
  app.use("/orders", orderRoute);
  app.use("/", (req, res) => {
    res.send("Product Management for Ecommerce Services");
  });
  app.use(notFound);
  app.use(errorHandler);
};
