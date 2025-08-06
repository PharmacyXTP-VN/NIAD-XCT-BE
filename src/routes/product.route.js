const express = require("express");
const router = express.Router();
const carController = require("../controllers/product.controller");
const specificationsController = require("../controllers/specifications.controller");
const upload = require("../middlewares/upload");

router.get("/", carController.list);
router.get("/home-summary", carController.homeSummary);
router.get("/:id", carController.getProductById);
router.post(
  "/",
  upload.fields([
    { name: "main", maxCount: 1 },
    { name: "gallery", maxCount: 10 }, // Cho phép tối đa 10 ảnh gallery
    { name: "front", maxCount: 1 },    // Hỗ trợ tương thích ngược với model cũ
    { name: "back", maxCount: 1 },     // Hỗ trợ tương thích ngược với model cũ
    { name: "left", maxCount: 1 },     // Hỗ trợ tương thích ngược với model cũ
    { name: "right", maxCount: 1 },    // Hỗ trợ tương thích ngược với model cũ
    { name: "specifications", maxCount: 1 },
  ]),
  carController.createProduct
);
router.put(
  "/:id",
  upload.fields([
    { name: "main", maxCount: 1 },
    { name: "gallery", maxCount: 10 }, // Cho phép tối đa 10 ảnh gallery
    { name: "front", maxCount: 1 },    // Hỗ trợ tương thích ngược với model cũ
    { name: "back", maxCount: 1 },     // Hỗ trợ tương thích ngược với model cũ
    { name: "left", maxCount: 1 },     // Hỗ trợ tương thích ngược với model cũ
    { name: "right", maxCount: 1 },    // Hỗ trợ tương thích ngược với model cũ
    { name: "specifications", maxCount: 1 },
  ]),
  carController.updateProduct
);
router.delete("/delete/:id", carController.deleteProduct);

// Route để cập nhật chỉ gallery của sản phẩm
router.put("/gallery/:id", carController.updateGallery);

// Route để upload/update specifications image
router.put("/specifications/:id", upload.single('specifications'), specificationsController.uploadSpecifications);
router.patch("/specifications-url/:id", specificationsController.updateSpecificationsUrl);

module.exports = router;
