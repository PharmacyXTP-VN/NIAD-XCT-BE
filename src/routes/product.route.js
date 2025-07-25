const express = require("express");
const router = express.Router();
const carController = require("../controllers/product.controller");
const upload = require("../middlewares/upload");

router.get("/", carController.list);
router.get("/home-summary", carController.homeSummary);
router.get("/:id", carController.getProductById);
router.post(
  "/",
  upload.fields([
    { name: "main", maxCount: 1 },
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "left", maxCount: 1 },
    { name: "right", maxCount: 1 },
  ]),
  carController.createProduct
);
router.put(
  "/:id",
  upload.fields([
    { name: "main", maxCount: 1 },
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "left", maxCount: 1 },
    { name: "right", maxCount: 1 },
  ]),
  carController.updateProduct
);
router.delete("/delete/:id", carController.deleteProduct);

module.exports = router;