const Car = require("../models/product.model");
const { uploadProductImageToCloudinary } = require("../util/cloudinary.service");
const mongoose = require("mongoose");

exports.list = async (req, res) => {
  try {
    const { manufacturer, model, search } = req.query;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let filter = {};

    if (manufacturer) filter.manufacturer = { $regex: `^${manufacturer}$`, $options: "i" };
    if (model) filter.model = { $regex: `^${model}$`, $options: "i" };
    if (search) filter.model = { $regex: search, $options: "i" };

    const total = await Car.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: cars.length ? "Get car list successfully" : "No cars found",
      data: cars,
      total,
      totalPages,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.homeSummary = async (req, res) => {
  try {
    const { manufacturer, model } = req.query;
    let match = {};
    if (manufacturer) match.manufacturer = { $regex: `^${manufacturer}$`, $options: "i" };
    if (model) match.model = { $regex: `^${model}$`, $options: "i" };
    const pipeline = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    pipeline.push(
      {
        $group: {
          _id: { manufacturer: "$manufacturer", model: "$model", name: "$name" },
          id: { $first: "$_id" },
          count: { $sum: 1 },
          price: { $first: "$price" },
          image: { $first: "$image" },
          seats: { $first: "$seats" },
          fuelType: { $first: "$fuelType" },
          transmission: { $first: "$transmission" },
          description: { $first: "$description" }
        }
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
              seats: "$seats",
              fuelType: "$fuelType",
              transmission: "$transmission",
              description: "$description"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id",
          models: 1
        }
      }
    );
    const summary = await Car.aggregate(pipeline);
    res.status(200).json({ message: "Get home car summary successfully", data: summary });
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
    res.status(200).json({ message: "Get product successfully", data: car });
  } catch (err) {
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
      "licensePlate", "price", "color", "seats", "fuelType", "transmission", "manufacturer", "model", "name", "year", "status", "description", "updatedBy"
    ];
    fields.forEach(field => {
      if (req.body[field] !== undefined) car[field] = req.body[field];
    });

    // Xử lý highlights (parse JSON string)
    if (req.body.highlights !== undefined) {
      try {
        car.highlights = typeof req.body.highlights === 'string' 
          ? JSON.parse(req.body.highlights) 
          : req.body.highlights;
      } catch (error) {
        return res.status(400).json({ message: "Invalid highlights format" });
      }
    }

    // Xử lý specifications (parse JSON string)
    if (req.body.specifications !== undefined) {
      try {
        car.specifications = typeof req.body.specifications === 'string' 
          ? JSON.parse(req.body.specifications) 
          : req.body.specifications;
      } catch (error) {
        return res.status(400).json({ message: "Invalid specifications format" });
      }
    }

    // Xử lý upload ảnh
    if (req.files) {
      const imageFields = ["main", "front", "back", "left", "right"];
      for (const field of imageFields) {
        if (req.files[field]) {
          // Chỉ lấy file đầu tiên nếu có nhiều file
          const file = req.files[field][0];
          const url = await uploadProductImageToCloudinary(file.buffer, `cars/${id}`);
          car.images[field] = url;
        }
      }
    }

    car.updatedAt = new Date();
    await car.save();
    res.status(200).json({ message: "Product updated successfully", data: car });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      licensePlate, price, color, seats, fuelType, transmission, 
      manufacturer, model, name, year, status, description, 
      highlights, specifications, createdBy, updatedBy
    } = req.body;

    // Validate required fields
    if (!licensePlate || !price || !seats || !fuelType || !transmission || !name || !createdBy) {
      return res.status(400).json({ 
        message: "Missing required fields: licensePlate, price, seats, fuelType, transmission, name, createdBy" 
      });
    }

    // Parse highlights và specifications nếu có
    let parsedHighlights = [];
    let parsedSpecifications = [];

    if (highlights) {
      try {
        parsedHighlights = typeof highlights === 'string' 
          ? JSON.parse(highlights) 
          : highlights;
      } catch (error) {
        return res.status(400).json({ message: "Invalid highlights format" });
      }
    }

    if (specifications) {
      try {
        parsedSpecifications = typeof specifications === 'string' 
          ? JSON.parse(specifications) 
          : specifications;
      } catch (error) {
        return res.status(400).json({ message: "Invalid specifications format" });
      }
    }

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
      status: status || 'active',
      description,
      highlights: parsedHighlights,
      specifications: parsedSpecifications,
      images: {
        main: "",
        front: "",
        back: "",
        left: "",
        right: ""
      },
      createdBy,
      updatedBy: updatedBy || createdBy
    };

    const car = new Car(carData);

    // Xử lý upload ảnh nếu có
    if (req.files) {
      const imageFields = ["main", "front", "back", "left", "right"];
      for (const field of imageFields) {
        if (req.files[field]) {
          const file = req.files[field][0];
          const url = await uploadProductImageToCloudinary(file.buffer, `cars/${car._id}`);
          car.images[field] = url;
        }
      }
    }

    await car.save();
    res.status(201).json({ 
      message: "Product created successfully", 
      data: car 
    });
  } catch (err) {
    console.error("Error creating product:", err);
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: "License plate already exists" 
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
      data: car 
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: err.message });
  }
};