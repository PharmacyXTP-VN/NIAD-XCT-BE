const express = require("express");
const router = express.Router();

const FooterContent = require("../models/footerContent.model");


// Lấy nội dung footer từ MongoDB
router.get("/", async (req, res) => {
  try {
    const doc = await FooterContent.findOne();
    if (!doc) {
      return res.json({ data: {
        address: "",
        phone: "",
        email: "",
        website: "",
        embedMap: ""
      }});
    }
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đọc dữ liệu footer" });
  }
});


// Lưu nội dung footer vào MongoDB
router.post("/", async (req, res) => {
  try {
    const { address, phone, email, website, embedMap } = req.body;
    let doc = await FooterContent.findOne();
    if (!doc) {
      doc = new FooterContent({ address, phone, email, website, embedMap });
    } else {
      doc.address = address;
      doc.phone = phone;
      doc.email = email;
      doc.website = website;
      doc.embedMap = embedMap;
    }
    await doc.save();
    res.json({ message: "Lưu thành công", data: doc });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lưu dữ liệu footer" });
  }
});

module.exports = router;
