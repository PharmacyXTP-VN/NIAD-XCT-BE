const Car = require("../models/product.model");
const {
  uploadProductImageToCloudinary,
} = require("../util/cloudinary.service");
const mongoose = require("mongoose");

// Cập nhật chỉ mảng gallery cho sản phẩm
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

exports.list = async (req, res) => {
  try {
    const { manufacturer, model, search } = req.query;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let filter = {};

    if (manufacturer)
      filter.manufacturer = { $regex: `^${manufacturer}$`, $options: "i" };
    if (model) filter.model = { $regex: `^${model}$`, $options: "i" };
    if (search) filter.model = { $regex: search, $options: "i" };

    const total = await Car.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    // Kiểm tra và chuyển đổi specifications cho mỗi xe
    const processedCars = cars.map(car => {
      const carObj = car.toObject();
      if (carObj.specifications && typeof carObj.specifications !== 'string') {
        carObj.specifications = '';
      }
      return carObj;
    });

    res.status(200).json({
      message: cars.length ? "Get car list successfully" : "No cars found",
      data: processedCars,
      total,
      totalPages,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.homeSummary = async (req, res) => {
  try {
    const { manufacturer, model } = req.query;
    let match = {};
    if (manufacturer)
      match.manufacturer = { $regex: `^${manufacturer}$`, $options: "i" };
    if (model) match.model = { $regex: `^${model}$`, $options: "i" };
    const pipeline = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    pipeline.push(
      {
        $group: {
          _id: {
            manufacturer: "$manufacturer",
            model: "$model",
            name: "$name",
          },
          id: { $first: "$_id" },
          count: { $sum: 1 },
          price: { $first: "$price" },
          image: { $first: "$image" },
          images: { $first: "$images" },
          seats: { $first: "$seats" },
          fuelType: { $first: "$fuelType" },
          transmission: { $first: "$transmission" },
          description: { $first: "$description" },
        },
      },
      {
        $group: {
          _id: "$_id.manufacturer",
          models: {
            $push: {
              id: "$id",
              model: "$_id.model",
              name: "$_id.name",
              count: "$count",
              price: "$price",
              image: "$image",
              images: "$images",
              seats: "$seats",
              fuelType: "$fuelType",
              transmission: "$transmission",
              description: "$description",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id",
          models: 1,
        },
      }
    );
    const summary = await Car.aggregate(pipeline);
    res
      .status(200)
      .json({ message: "Get home car summary successfully", data: summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Product not found", data: null });
    }
    
    // Kiểm tra và chuyển đổi specifications nếu nó đang là mảng hoặc object
    const carObject = car.toObject();
    if (carObject.specifications && typeof carObject.specifications !== 'string') {
      // Nếu specifications là mảng hoặc object, đặt nó thành chuỗi rỗng
      carObject.specifications = '';
      
      // Lưu lại để cập nhật dữ liệu
      await Car.updateOne({ _id: id }, { specifications: '' });
    }
    
    res.status(200).json({ message: "Get product successfully", data: carObject });
  } catch (err) {
    console.error("Error getting product:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Cập nhật các trường cơ bản (loại trừ highlights và specifications)
    const fields = [
      "licensePlate",
      "price",
      "color",
      "seats",
      "fuelType",
      "transmission",
      "manufacturer",
      "model",
      "name",
      "year",
      "status",
      "description",
      "updatedBy",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) car[field] = req.body[field];
    });

    // Xử lý highlights (parse JSON string)
    if (req.body.highlights !== undefined) {
      try {
        car.highlights =
          typeof req.body.highlights === "string"
            ? JSON.parse(req.body.highlights)
            : req.body.highlights;
      } catch (error) {
        return res.status(400).json({ message: "Invalid highlights format" });
      }
    }
    
    // Xử lý highlightFeatures (HTML từ CKEditor)
    if (req.body.highlightFeatures !== undefined) {
      car.highlightFeatures = req.body.highlightFeatures;
    }

    // Xử lý specifications - luôn là một hình ảnh
    if (req.files && req.files.specifications) {
      // Nếu có file specifications mới được tải lên
      const file = req.files.specifications[0];
      const url = await uploadProductImageToCloudinary(
        file.buffer,
        `cars/${id}/specifications`
      );
      car.specifications = url;
    } else if (req.body.specificationsUrl) {
      // Nếu không có file mới nhưng có URL cũ
      car.specifications = req.body.specificationsUrl;
    }

    // Xử lý upload ảnh
    if (req.files) {
      // Xử lý ảnh chính
      if (req.files.main) {
        const file = req.files.main[0];
        const url = await uploadProductImageToCloudinary(
          file.buffer,
          `cars/${id}/main`
        );
        car.images.main = url;
      }
      
      // Xử lý ảnh gallery (nhiều ảnh)
      if (req.files.gallery) {
        // Khởi tạo mảng gallery nếu chưa có
        if (!car.images.gallery) {
          car.images.gallery = [];
        }
        
        // Upload từng ảnh trong gallery
        const galleryPromises = req.files.gallery.map(async (file, index) => {
          const url = await uploadProductImageToCloudinary(
            file.buffer,
            `cars/${id}/gallery/${index}`
          );
          return url;
        });
        
        // Thêm các ảnh mới vào gallery
        const newGalleryUrls = await Promise.all(galleryPromises);
        car.images.gallery = [...car.images.gallery, ...newGalleryUrls];
      }
    }

    car.updatedAt = new Date();
    await car.save();
    res
      .status(200)
      .json({ message: "Product updated successfully", data: car });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      licensePlate,
      price,
      color,
      seats,
      fuelType,
      transmission,
      manufacturer,
      model,
      name,
      year,
      status,
      description,
      highlights,
      specifications,
      createdBy,
      updatedBy,
    } = req.body;

    // Validate required fields
    if (
      !licensePlate ||
      !price ||
      !seats ||
      !fuelType ||
      !transmission ||
      !name ||
      !createdBy
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: licensePlate, price, seats, fuelType, transmission, name, createdBy",
      });
    }

    // Parse highlights nếu có
    let parsedHighlights = [];

    if (highlights) {
      try {
        parsedHighlights =
          typeof highlights === "string" ? JSON.parse(highlights) : highlights;
      } catch (error) {
        return res.status(400).json({ message: "Invalid highlights format" });
      }
    }
    
    // Lấy highlightFeatures từ req.body (HTML từ CKEditor)

    // Tạo car object
    const carData = {
      licensePlate,
      price: Number(price),
      color,
      seats: Number(seats),
      fuelType,
      transmission,
      manufacturer,
      model,
      name,
      year: year ? Number(year) : undefined,
      status: status || "active",
      description,
      highlights: parsedHighlights,
      highlightFeatures: req.body.highlightFeatures || "", // HTML content từ CKEditor
      specifications: "", // Sẽ được cập nhật sau khi upload ảnh
      images: {
        main: "",
        gallery: [], // Mảng chứa nhiều ảnh gallery
      },
      createdBy,
      updatedBy: updatedBy || createdBy,
    };

    const car = new Car(carData);

    // Xử lý upload ảnh nếu có
    if (req.files) {
      // Xử lý ảnh chính
      if (req.files.main) {
        const file = req.files.main[0];
        const url = await uploadProductImageToCloudinary(
          file.buffer,
          `cars/${car._id}/main`
        );
        car.images.main = url;
      }
      
      // Xử lý ảnh gallery (nhiều ảnh)
      if (req.files.gallery) {
        // Upload từng ảnh trong gallery
        const galleryPromises = req.files.gallery.map(async (file, index) => {
          const url = await uploadProductImageToCloudinary(
            file.buffer,
            `cars/${car._id}/gallery/${index}`
          );
          return url;
        });
        
        // Lưu các URL ảnh vào gallery
        car.images.gallery = await Promise.all(galleryPromises);
      }

      // Xử lý upload ảnh specifications
      if (req.files.specifications) {
        const file = req.files.specifications[0];
        const url = await uploadProductImageToCloudinary(
          file.buffer,
          `cars/${car._id}/specifications`
        );
        car.specifications = url;
      }
    }

    await car.save();
    res.status(201).json({
      message: "Product created successfully",
      data: car,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        message: "License plate already exists",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByIdAndDelete(id);

    if (!car) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: car,
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: err.message });
  }
};
