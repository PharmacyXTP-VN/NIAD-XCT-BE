const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String }, // Short summary for list view
    content: { type: String, required: true },
    thumbnail: { type: String }, // Main image for the news
    publishedAt: { type: Date, default: Date.now }, // Publish date
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    tags: { type: [String], default: [] }, // Optional: tags for filtering/search
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);

module.exports = News;