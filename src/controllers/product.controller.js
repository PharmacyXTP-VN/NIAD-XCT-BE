const Car = require("../models/product.model");

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