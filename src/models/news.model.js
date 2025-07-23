const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    thumbnail: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);

module.exports = News;