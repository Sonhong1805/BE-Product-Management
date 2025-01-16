const {
  notFound,
  errorHandler,
} = require("../middlewares/errorHandler.middleware");
const authRoutes = require("./auth.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const roleRoutes = require("./role.routes");
const accountRoutes = require("./account.routes");
const blogRoutes = require("./blog.routes");
const settingRoutes = require("./setting.routes");
const variantRoutes = require("./variant.routes");
const cartRoutes = require("./cart.routes");
const wishlistRoutes = require("./wishlist.routes");
const ratingRoutes = require("./rating.routes");
const orderRoutes = require("./order.routes");
const contactRoutes = require("./contact.routes");
const API_VERSION = require("../configs/apiVersion");

module.exports = (app) => {
  app.use(`${API_VERSION}/auth`, authRoutes);
  app.use(`${API_VERSION}/categories`, categoryRoutes);
  app.use(`${API_VERSION}/products`, productRoutes);
  app.use(`${API_VERSION}/roles`, roleRoutes);
  app.use(`${API_VERSION}/accounts`, accountRoutes);
  app.use(`${API_VERSION}/blogs`, blogRoutes);
  app.use(`${API_VERSION}/settings`, settingRoutes);
  app.use(`${API_VERSION}/variants`, variantRoutes);
  app.use(`${API_VERSION}/carts`, cartRoutes);
  app.use(`${API_VERSION}/wishlist`, wishlistRoutes);
  app.use(`${API_VERSION}/ratings`, ratingRoutes);
  app.use(`${API_VERSION}/orders`, orderRoutes);
  app.use(`${API_VERSION}/contacts`, contactRoutes);
  app.use("/", (req, res) => {
    res.send("Product Management for Ecommerce Services");
  });
  app.use(notFound);
  app.use(errorHandler);
};
