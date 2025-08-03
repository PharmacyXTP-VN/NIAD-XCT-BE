const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Đường dẫn tới thư mục public của frontend
const getFrontendPublicPath = () => {
  // Đường dẫn tuyệt đối đến thư mục public của frontend
  return path.join(__dirname, '../../../NIAD-XCT/public');
};

/**
 * Xóa file ảnh từ thư mục public
 * @param {string} imageUrl - URL tương đối của ảnh cần xóa (ví dụ: /images/banners/abc.jpg)
 * @returns {Promise<boolean>} Kết quả xóa file
 */
const deleteImageFromPublicFolder = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.log('URL ảnh không hợp lệ:', imageUrl);
      return false;
    }
    
    // Loại bỏ dấu / đầu tiên nếu có
    const relativePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    const imagePath = path.join(getFrontendPublicPath(), relativePath);
    
    // Kiểm tra xem file có tồn tại không
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Đã xóa file: ${imagePath}`);
      return true;
    } else {
      console.log(`File không tồn tại: ${imagePath}`);
      return false;
    }
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
    return false;
  }
};

/**
 * Lưu file ảnh vào thư mục public của frontend
 * @param {Buffer} fileBuffer - Buffer của file ảnh
 * @param {string} fileName - Tên file gốc
 * @param {string} type - Loại ảnh ('banner', 'advantage', 'partner')
 * @returns {Promise<string>} URL của file ảnh
 */
const saveImageToPublicFolder = async (fileBuffer, fileName, type) => {
  try {
    // Xác định thư mục lưu trữ dựa vào type
    let targetFolder;
    switch (type) {
      case 'banner':
        targetFolder = 'banners';
        break;
      case 'partner':
        targetFolder = 'partners'; // Thư mục riêng cho đối tác
        break;
      case 'advantage':
        targetFolder = 'advantages'; // Thư mục riêng cho ưu điểm
        break;
      case 'page-banner':
        targetFolder = 'page-banners'; // Thư mục riêng cho banner trang con
        break;
      case 'about':
        targetFolder = 'about'; // Thư mục riêng cho trang giới thiệu
        break;
      default:
        targetFolder = '';
    }
    
    const folderPath = path.join(getFrontendPublicPath(), 'images', targetFolder);

    // Đảm bảo thư mục tồn tại, nếu không thì tạo mới
    if (!fs.existsSync(folderPath)) {
      console.log(`Thư mục không tồn tại, đang tạo mới: ${folderPath}`);
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Tạo tên file duy nhất
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(folderPath, uniqueFileName);

    try {
      // Ghi file
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`Đã lưu file thành công tại: ${filePath}`);
      
      // Kiểm tra file đã được tạo chưa
      if (!fs.existsSync(filePath)) {
        throw new Error(`File không được tạo tại: ${filePath}`);
      }
      
      const fileSize = fs.statSync(filePath).size;
      console.log(`Kích thước file đã lưu: ${fileSize} bytes`);
      
      // Trả về đường dẫn URL tương đối để sử dụng trong frontend
      return `/images/${targetFolder}/${uniqueFileName}`;
    } catch (err) {
      console.error(`Lỗi khi ghi file: ${err.message}`);
      throw err;
    }
  } catch (error) {
    console.error('Error saving image to public folder:', error);
    throw error;
  }
};

module.exports = {
  saveImageToPublicFolder,
  deleteImageFromPublicFolder
};
