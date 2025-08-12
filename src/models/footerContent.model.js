const mongoose = require("mongoose");
const { Schema } = mongoose;

const footerContentSchema = new Schema(
  {
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    embedMap: { type: String, default: "" },
  },
  { timestamps: true }
);

// Chỉ lưu 1 document duy nhất, dùng static id 'singleton'
footerContentSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

const FooterContent = mongoose.model("FooterContent", footerContentSchema);

module.exports = FooterContent;
