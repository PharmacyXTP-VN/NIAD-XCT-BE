const express = require("express");
const router = express.Router();
const imageSettingController = require("../controllers/image.setting.controller");
const uploadMiddleware = require("../middlewares/upload");

// Get all images by type (banner, partner, advantage)
router.get("/:type", imageSettingController.getImagesByType);

// Add a new image
router.post("/", uploadMiddleware.single("image"), imageSettingController.addImage);

// Update an image
router.put("/:id", uploadMiddleware.single("image"), imageSettingController.updateImage);

// Delete an image
router.delete("/:id", imageSettingController.deleteImage);

// Reorder images of a type
router.put("/reorder/:type", imageSettingController.reorderImages);

module.exports = router;
