const express = require("express");
const router = express.Router();
const blogsController = require("../controllers/blogs.controller");
const upload = require("../middlewares/uploadCloudinary.middleware");
const authenticateJWT = require("../middlewares/jwt.middleware");

router.get("/", blogsController.index);
router.get("/:slug", blogsController.detail);
router.post(
  "/",
  authenticateJWT,
  upload.single("thumbnail"),
  blogsController.create
);
router.patch(
  "/:id",
  authenticateJWT,
  upload.single("thumbnail"),
  blogsController.update
);
router.delete("/:id", blogsController.delete);
router.post("/feature", blogsController.changeFeature);

module.exports = router;
