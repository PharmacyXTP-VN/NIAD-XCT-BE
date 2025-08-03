const multer = require("multer");

// Sử dụng multer với bộ nhớ tạm thời (memoryStorage)
const storage = multer.memoryStorage(); // Lưu tạm vào bộ nhớ RAM

// Giới hạn kích thước file upload tối đa là 10MB
const upload = multer({ 
  storage: storage,

  fileFilter: (req, file, cb) => {
    // Kiểm tra loại file
    if (file.mimetype.startsWith('image/')) {
      console.log(`Accepting file: ${file.originalname}, type: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`Rejecting file: ${file.originalname}, type: ${file.mimetype}`);
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;