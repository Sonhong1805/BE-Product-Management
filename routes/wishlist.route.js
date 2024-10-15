const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const authenticateJWT = require("../middlewares/jwt.middleware");

router.post("/", authenticateJWT, wishlistController.create);
router.delete("/:id", authenticateJWT, wishlistController.delete);

module.exports = router;
