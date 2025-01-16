const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings.controller");
const upload = require("../middlewares/uploadCloudinary.middleware");

router.get("/", settingsController.index);
router.patch("/:id", upload.single("logo"), settingsController.update);
router.get("/dashboard", settingsController.dashboard);

module.exports = router;
