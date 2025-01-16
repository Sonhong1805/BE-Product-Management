const express = require("express");
const cartsController = require("../controllers/carts.controller");
const router = express.Router();
const authenticateJWT = require("../middlewares/jwt.middleware");

router.post("/", authenticateJWT, cartsController.create);
router.patch("/:cid/:id", cartsController.update);
router.delete("/:cid/:id", cartsController.delete);
router.put("/:cid/selected", cartsController.selected);

module.exports = router;
