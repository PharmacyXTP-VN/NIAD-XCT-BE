const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    color: { type: String },
    seats: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
    },
    manufacturer: { type: String },
    model: { type: String },
    name: { type: String, required: true },
    year: { type: Number },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String },
    highlights: {
      type: [
        {
          name: { type: String, required: true },
          value: { type: String },
        },
      ],
      default: [],
    },
    highlightFeatures: { type: String, default: "" }, // HTML content from CKEditor
    specifications: { type: String, default: "" }, // URL ảnh thông số kỹ thuật
    // Images: main image and gallery images array
    images: {
      main: { type: String, default: "" },
      gallery: [{ type: String }], // Array of image URLs for gallery
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);
