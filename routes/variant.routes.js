const express = require("express");
const router = express.Router();
const variantsController = require("../controllers/variants.controller");
const upload = require("../middlewares/uploadCloudinary.middleware");

router.get("/:pSlug", variantsController.index);
router.post("/:pSlug", upload.single("thumbnail"), variantsController.create);
router.patch(
  "/:pSlug/:vid",
  upload.single("thumbnail"),
  variantsController.update
);
router.delete("/:pSlug/:vid", variantsController.delete);

module.exports = router;
