const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");

router.get("/", categoriesController.index);
router.get("/:slug", categoriesController.detail);
router.post("/", categoriesController.create);
router.patch("/:slug", categoriesController.update);
router.delete("/:slug", categoriesController.delete);
router.post("/feature", categoriesController.changeFeature);
router.post("/get-sub-categories", categoriesController.getSubCategories);
router.post("/get-parent-categories", categoriesController.getParentCategories);

module.exports = router;
