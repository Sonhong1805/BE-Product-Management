const express = require("express");
const router = express.Router();
const contactsController = require("../controllers/contacts.controller");

router.get("/", contactsController.index);
router.get("/:id", contactsController.detail);
router.post("/", contactsController.create);
router.delete("/:id", contactsController.delete);
router.post("/feature", contactsController.changeFeature);
router.post("/accept", contactsController.accept);

module.exports = router;
