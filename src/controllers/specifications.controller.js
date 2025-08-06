const Car = require('../models/product.model');
const { uploadImageToCloudinary } = require('../util/cloudinary.service');

/**
 * Upload specifications image for a product
 */
exports.uploadSpecifications = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No specifications image file provided" });
    }
    
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Upload ảnh lên Cloudinary
    const fileName = `${car.name.toLowerCase().replace(/\s+/g, '-')}-specifications`;
    const cloudinaryUrl = await uploadImageToCloudinary(req.file.buffer, 'specifications', fileName);
    
    // Cập nhật specifications trong database
    car.specifications = cloudinaryUrl;
    car.updatedAt = new Date();
    
    await car.save();
    
    res.status(200).json({ 
      message: "Specifications image uploaded successfully", 
      specificationsUrl: cloudinaryUrl,
      product: car 
    });
    
  } catch (error) {
    console.error("Error uploading specifications:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update specifications URL directly
 */
exports.updateSpecificationsUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { specificationsUrl } = req.body;
    
    if (!specificationsUrl) {
      return res.status(400).json({ message: "Specifications URL is required" });
    }
    
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Cập nhật specifications URL
    car.specifications = specificationsUrl;
    car.updatedAt = new Date();
    
    await car.save();
    
    res.status(200).json({ 
      message: "Specifications URL updated successfully", 
      specificationsUrl: car.specifications,
      product: car 
    });
    
  } catch (error) {
    console.error("Error updating specifications URL:", error);
    res.status(500).json({ message: error.message });
  }
};
