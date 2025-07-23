const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    image: { type: String },
    price: { type: Number, required: true },
    color: { type: String },
    seats: { type: Number, required: true },
    fuelType: { type: String, enum: ["petrol", "diesel", "electric"], required: true },
    transmission: { type: String, enum: ["manual", "automatic"], required: true },
    features: { type: [String] }, 
    availability: { type: Boolean, default: true },
    condition: { type: String, enum: ["new", "used"], default: "used" },
    manufacturer: { type: String },
    model: { type: String },
    name: { type: String, required: true },
    year: { type: Number },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);