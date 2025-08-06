const cloudinary = require('cloudinary').v2;
const { compressToSize } = require('./image-compress.service');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadProductImageToCloudinary = async (imageBuffer, folder = 'uploads') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!imageBuffer) {
        reject(new Error('Empty file'));
        return;
      }

      // Chuyển buffer thành stream để upload lên Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading image to Cloudinary:", error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      // Ghi buffer vào stream
      uploadStream.end(imageBuffer);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      reject(error);
    }
  });
};

/**
 * Upload image management images to Cloudinary with compression
 * @param {Buffer} imageBuffer - Buffer của file ảnh
 * @param {string} type - Loại ảnh ('banner', 'partner', 'advantage', 'page-banner', 'about')
 * @param {string} originalName - Tên file gốc
 * @returns {Promise<string>} URL của ảnh trên Cloudinary
 */
const uploadImageToCloudinary = async (imageBuffer, type, originalName = 'image') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!imageBuffer) {
        reject(new Error('Empty file'));
        return;
      }

      console.log(`Original file size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      
      // Compress ảnh trước khi upload lên Cloudinary (target: 9MB for Cloudinary free tier)
      const compressedBuffer = await compressToSize(imageBuffer, 9);
      console.log(`Compressed file size: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB`);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `image-management/${type}`, // Tổ chức theo type
          resource_type: 'auto',
          public_id: `${type}_${Date.now()}`, // Unique public ID
          overwrite: false,
          invalidate: true,
          // Transformation để optimize thêm nếu cần
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading image to Cloudinary:", error);
            reject(error);
          } else {
            console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(compressedBuffer);
    } catch (error) {
      console.error("Error in uploadImageToCloudinary:", error);
      reject(error);
    }
  });
};

/**
 * Xóa ảnh từ Cloudinary
 * @param {string} imageUrl - URL của ảnh trên Cloudinary
 * @returns {Promise<boolean>} Kết quả xóa
 */
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.log('URL không phải Cloudinary, bỏ qua:', imageUrl);
      return false;
    }

    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.log('Không thể trích xuất public_id từ URL:', imageUrl);
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`Đã xóa ảnh khỏi Cloudinary: ${publicId}`);
      return true;
    } else {
      console.log(`Không thể xóa ảnh: ${result.result}`);
      return false;
    }
  } catch (error) {
    console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
    return false;
  }
};

/**
 * Trích xuất public_id từ Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID
 */
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // Lấy phần sau 'upload' và version (v1234567890)
    const afterUpload = urlParts.slice(uploadIndex + 2); // Bỏ qua 'upload' và version
    const pathWithExt = afterUpload.join('/');
    
    // Bỏ extension
    const lastDotIndex = pathWithExt.lastIndexOf('.');
    const publicId = lastDotIndex > 0 ? pathWithExt.substring(0, lastDotIndex) : pathWithExt;
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

module.exports = {
  uploadProductImageToCloudinary,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  extractPublicIdFromUrl
}