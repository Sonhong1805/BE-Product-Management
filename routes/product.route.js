const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");
const upload = require("../middlewares/uploadCloudinary.middleware");

router.get("/", productsController.index);
router.get("/:slug", productsController.detail);
router.post(
  "/",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  productsController.create
);
router.patch(
  "/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  productsController.update
);
router.delete("/:id", productsController.delete);
router.post("/feature", productsController.changeFeature);
router.post(
  "/upload",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  productsController.upload
);

module.exports = router;
