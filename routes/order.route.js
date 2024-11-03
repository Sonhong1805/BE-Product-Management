const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");
const authenticateJWT = require("../middlewares/jwt.middleware");

router.get("/", ordersController.index);
router.get("/:id", ordersController.detail);
router.get("/user/:uid", ordersController.detailByUserId);
router.post("/:cid", authenticateJWT, ordersController.create);
router.patch("/:id", ordersController.update);
router.delete("/:id", ordersController.delete);
router.put("/feature", ordersController.changeFeature);

module.exports = router;
