exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { gallery } = req.body;
    
    if (!Array.isArray(gallery)) {
      return res.status(400).json({ 
        message: "Invalid gallery data. Expected array." 
      });
    }
    
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Cập nhật mảng gallery
    car.images.gallery = gallery;
    car.updatedAt = new Date();
    
    await car.save();
    
    res.status(200).json({ 
      message: "Gallery updated successfully", 
      data: car 
    });
  } catch (err) {
    console.error("Error updating gallery:", err);
    res.status(500).json({ message: err.message });
  }
};
