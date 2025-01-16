const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/roles.controller");

router.get("/", rolesController.index);
router.get("/:id", rolesController.detail);
router.post("/", rolesController.create);
router.patch("/:id", rolesController.update);
router.delete("/:id", rolesController.delete);
router.post("/feature", rolesController.changeFeature);
router.post("/updatePermissions", rolesController.updatePermissions);

module.exports = router;
