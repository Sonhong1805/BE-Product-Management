const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");

router.get("/", categoriesController.index);
router.get("/:id", categoriesController.detail);
router.post("/", categoriesController.create);
router.patch("/:id", categoriesController.update);
router.delete("/:id", categoriesController.delete);
router.post("/feature", categoriesController.changeFeature);
router.post("/get-sub-categories", categoriesController.getSubCategories);
router.post("/get-parent-categories", categoriesController.getParentCategories);

module.exports = router;
