const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    color: { type: String },
    seats: { type: Number, required: true },
    fuelType: { type: String, enum: ["petrol", "diesel", "electric"], required: true },
    transmission: { type: String, enum: ["manual", "automatic"], required: true },
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
          value: { type: String }
        }
      ],
      default: []
    },
    specifications: {
      type: [
        {
          name: { type: String, required: true },
          value: { type: String }
        }
      ],
      default: []
    },
    // Images: object with front, back, left, right
    images: {
      main: { type: String, default: "" }, 
      front: { type: String, default: "" },
      back: { type: String, default: "" },
      left: { type: String, default: "" },
      right: { type: String, default: "" }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);