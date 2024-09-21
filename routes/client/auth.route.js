const express = require("express");
const authController = require("../../controllers/client/auth.controller");
const router = express.Router();
const validate = require("../../middlewares/validate.middleware");
const authenticateJWT = require("../../middlewares/jwt.middleware");

router.post("/login", validate.inputsLogin, authController.login);
router.post("/register", validate.inputsRegister, authController.register);
router.get("/account", authenticateJWT, authController.account);
router.get("/refresh", authController.refresh);

module.exports = router;
