const express = require("express");
const router = express.Router();
const ratingsController = require("../controllers/ratings.controller");
const authenticateJWT = require("../middlewares/jwt.middleware");

router.post("/:pid", authenticateJWT, ratingsController.create);

module.exports = router;
