const express = require("express");
const router = express.Router();
const accountsController = require("../controllers/accounts.controller");
const upload = require("../middlewares/uploadCloudinary.middleware");
const validate = require("../middlewares/validate.middleware");

router.get("/", accountsController.index);
router.get("/:id", accountsController.detail);
router.post(
  "/",
  upload.single("avatar"),
  validate.inputsRegister,
  accountsController.create
);
router.patch("/:id", upload.single("avatar"), accountsController.update);
router.delete("/:id", accountsController.delete);
router.post("/feature", accountsController.changeFeature);

module.exports = router;
