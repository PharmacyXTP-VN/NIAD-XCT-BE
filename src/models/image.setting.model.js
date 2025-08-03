const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSettingSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["banner", "partner", "advantage", "page-banner", "about"],
      required: true,
    },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageSetting", imageSettingSchema);
