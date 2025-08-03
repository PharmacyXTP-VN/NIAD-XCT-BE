const ImageSetting = require("../models/image.setting.model");
const { saveImageToPublicFolder, deleteImageFromPublicFolder } = require("../util/local-storage.service");

// Get all images of a specific type
exports.getImagesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type
    if (!["banner", "partner", "advantage", "page-banner", "about"].includes(type)) {
      return res.status(400).json({
        message: "Invalid image type. Must be 'banner', 'partner', 'advantage', 'page-banner', or 'about'."
      });
    }
    
    const images = await ImageSetting.find({ type })
      .sort({ order: 1, createdAt: -1 });
    
    console.log(`Fetched ${images.length} images of type '${type}':`);
    images.forEach(img => {
      console.log(`- ID: ${img._id}, URL: ${img.url}, Title: ${img.title}`);
    });
    
    res.status(200).json({
      message: "Images retrieved successfully",
      data: images
    });
  } catch (err) {
    console.error("Error getting images:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add a new image
exports.addImage = async (req, res) => {
  try {
    const { type, title, description, order } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        message: "Image file is required"
      });
    }
    
    // Validate type
    if (!["banner", "partner", "advantage", "page-banner", "about"].includes(type)) {
      return res.status(400).json({
        message: "Invalid image type. Must be 'banner', 'partner', 'advantage', 'page-banner', or 'about'."
      });
    }
    
    // Lưu ảnh vào thư mục public
    const imageUrl = await saveImageToPublicFolder(file.buffer, file.originalname, type);
    
    // Create new image setting
    const newImage = new ImageSetting({
      type,
      title: title || "",
      description: description || "",
      url: imageUrl,
      order: order || 0,
      active: true,
      createdBy: req.body.createdBy,
      updatedBy: req.body.createdBy
    });
    
    await newImage.save();
    
    res.status(201).json({
      message: "Image added successfully",
      data: newImage
    });
  } catch (err) {
    console.error("Error adding image:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update an image
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order, active } = req.body;
    const file = req.file;
    
    const image = await ImageSetting.findById(id);
    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }
    
    // Update fields
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;
    if (order !== undefined) image.order = order;
    if (active !== undefined) image.active = active;
    
    // Update image URL if a new file is provided
    if (file) {
      // Xóa ảnh cũ nếu có
      if (image.url) {
        await deleteImageFromPublicFolder(image.url);
      }
      // Lưu ảnh mới
      const imageUrl = await saveImageToPublicFolder(file.buffer, file.originalname, image.type);
      image.url = imageUrl;
    }
    
    image.updatedBy = req.body.updatedBy;
    image.updatedAt = new Date();
    
    await image.save();
    
    res.status(200).json({
      message: "Image updated successfully",
      data: image
    });
  } catch (err) {
    console.error("Error updating image:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete an image
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin ảnh trước khi xóa
    const image = await ImageSetting.findById(id);
    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }
    
    // Xóa file ảnh từ thư mục public
    if (image.url) {
      await deleteImageFromPublicFolder(image.url);
    }
    
    // Xóa record trong database
    await ImageSetting.findByIdAndDelete(id);
    
    res.status(200).json({
      message: "Image deleted successfully",
      data: image
    });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ message: err.message });
  }
};

// Change the order of images
exports.reorderImages = async (req, res) => {
  try {
    const { type } = req.params;
    const { imageOrders } = req.body;
    
    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({
        message: "imageOrders must be an array of {id, order} objects"
      });
    }
    
    // Update each image's order
    for (const item of imageOrders) {
      await ImageSetting.findByIdAndUpdate(
        item.id,
        { order: item.order, updatedBy: req.body.updatedBy },
        { new: true }
      );
    }
    
    // Get updated images
    const updatedImages = await ImageSetting.find({ type })
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      message: "Images reordered successfully",
      data: updatedImages
    });
  } catch (err) {
    console.error("Error reordering images:", err);
    res.status(500).json({ message: err.message });
  }
};
