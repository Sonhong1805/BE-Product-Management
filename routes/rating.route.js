const express = require("express");
const router = express.Router();
const ratingsController = require("../controllers/ratings.controller");
const authenticateJWT = require("../middlewares/jwt.middleware");

router.post("/:pid", authenticateJWT, ratingsController.create);
router.delete("/:pid/:id", ratingsController.delete);

module.exports = router;
