const express = require("express");
const router = express.Router();
const carController = require("../controllers/product.controller");

router.get("/", carController.list);
router.get("/home-summary", carController.homeSummary);
router.get("/:id", carController.getProductById);

module.exports = router;