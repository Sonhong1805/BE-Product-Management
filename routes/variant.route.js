const express = require("express");
const router = express.Router();
const variantsController = require("../controllers/variants.controller");
const upload = require("../middlewares/uploadCloudinary.middleware");

router.get("/:pid", variantsController.index);
router.post("/:pid", upload.single("thumbnail"), variantsController.create);
router.patch(
  "/:pid/:vid",
  upload.single("thumbnail"),
  variantsController.update
);
router.delete("/:pid/:vid", variantsController.delete);

module.exports = router;
