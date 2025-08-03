const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Lưu file từ buffer vào thư mục public
 * @param {Buffer} fileBuffer - Buffer của file cần lưu
 * @param {string} originalFilename - Tên file gốc
 * @param {string} type - Loại ảnh ('banner', 'partner', 'advantage')
 * @returns {Promise<string>} - Đường dẫn của file sau khi lưu
 */
const saveImageToPublic = async (fileBuffer, originalFilename, type) => {
  try {
    // Tạo thư mục public/images nếu chưa tồn tại
    const baseDir = path.join(__dirname, '../../public');
    const imagesDir = path.join(baseDir, 'images');
    const typeDir = path.join(imagesDir, type);
    
    // Tạo các thư mục nếu chưa tồn tại
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir);
    }

    // Tạo tên file độc nhất dựa trên thời gian và mã hash
    const fileExt = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, fileExt);
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(baseName + timestamp).digest('hex').substring(0, 8);
    const newFilename = `${baseName}-${hash}${fileExt}`;

    // Đường dẫn đầy đủ của file
    const filePath = path.join(typeDir, newFilename);
    
    // Ghi file
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // Trả về đường dẫn URL để truy cập file từ frontend
    return `/images/${type}/${newFilename}`;
  } catch (error) {
    console.error('Error saving image to public folder:', error);
    throw error;
  }
};

/**
 * Xóa file từ thư mục public
 * @param {string} filePath - Đường dẫn URL của file cần xóa
 * @returns {Promise<boolean>} - Kết quả xóa file
 */
const deleteImageFromPublic = async (filePath) => {
  try {
    // Chuyển từ URL sang đường dẫn thực tế
    // Ví dụ: từ "/images/banner/file.jpg" thành "../../public/images/banner/file.jpg"
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(__dirname, '../../public', relativePath);
    
    // Kiểm tra file có tồn tại không
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image from public folder:', error);
    return false;
  }
};

module.exports = {
  saveImageToPublic,
  deleteImageFromPublic
};
