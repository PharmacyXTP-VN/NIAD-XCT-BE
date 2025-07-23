const multer = require("multer");

// Sử dụng multer với bộ nhớ tạm thời (memoryStorage)
const storage = multer.memoryStorage(); // Lưu tạm vào bộ nhớ RAM

const upload = multer({ storage });

module.exports = upload;