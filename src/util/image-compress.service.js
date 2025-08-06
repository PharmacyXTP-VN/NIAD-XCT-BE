const sharp = require('sharp');

/**
 * Compress và resize ảnh để giảm kích thước file
 * @param {Buffer} imageBuffer - Buffer của ảnh gốc
 * @param {Object} options - Tùy chọn compress
 * @returns {Promise<Buffer>} Buffer của ảnh đã compress
 */
const compressImage = async (imageBuffer, options = {}) => {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 80,
      format = 'jpeg'
    } = options;

    // Kiểm tra kích thước ảnh gốc
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    let processedImage = sharp(imageBuffer);

    // Resize nếu ảnh quá lớn
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      processedImage = processedImage.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Compress theo format
    if (format === 'jpeg') {
      processedImage = processedImage.jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true
      });
    } else if (format === 'webp') {
      processedImage = processedImage.webp({ 
        quality,
        effort: 6
      });
    } else if (format === 'png') {
      processedImage = processedImage.png({ 
        compressionLevel: 9,
        quality
      });
    }

    const compressedBuffer = await processedImage.toBuffer();
    const newSize = (compressedBuffer.length / 1024 / 1024).toFixed(2);
    
    console.log(`Compressed image: size: ${newSize}MB, reduction: ${((1 - compressedBuffer.length / imageBuffer.length) * 100).toFixed(1)}%`);
    
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * Tự động chọn mức compress phù hợp để đạt target size
 * @param {Buffer} imageBuffer - Buffer của ảnh gốc
 * @param {number} targetSizeMB - Kích thước mục tiêu (MB)
 * @returns {Promise<Buffer>} Buffer của ảnh đã compress
 */
const compressToSize = async (imageBuffer, targetSizeMB = 8) => {
  try {
    const originalSizeMB = imageBuffer.length / 1024 / 1024;
    
    if (originalSizeMB <= targetSizeMB) {
      console.log(`Image already under ${targetSizeMB}MB, no compression needed`);
      return imageBuffer;
    }

    // Thử compress với các mức quality khác nhau
    const qualityLevels = [70, 60, 50, 40, 30];
    
    for (let quality of qualityLevels) {
      const compressed = await compressImage(imageBuffer, { 
        quality,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'jpeg'
      });
      
      const compressedSizeMB = compressed.length / 1024 / 1024;
      
      if (compressedSizeMB <= targetSizeMB) {
        console.log(`Achieved target size with quality ${quality}%`);
        return compressed;
      }
    }

    // Nếu vẫn chưa đạt, thử resize nhỏ hơn
    const resizeOptions = [
      { width: 1440, height: 810 },
      { width: 1280, height: 720 },
      { width: 1024, height: 576 }
    ];

    for (let resize of resizeOptions) {
      const compressed = await compressImage(imageBuffer, {
        quality: 60,
        maxWidth: resize.width,
        maxHeight: resize.height,
        format: 'jpeg'
      });
      
      const compressedSizeMB = compressed.length / 1024 / 1024;
      
      if (compressedSizeMB <= targetSizeMB) {
        console.log(`Achieved target size with resize ${resize.width}x${resize.height}`);
        return compressed;
      }
    }

    // Cuối cùng, trả về ảnh với compression cao nhất
    return await compressImage(imageBuffer, { 
      quality: 30,
      maxWidth: 1024,
      maxHeight: 576,
      format: 'jpeg'
    });
    
  } catch (error) {
    console.error('Error in compressToSize:', error);
    throw error;
  }
};

module.exports = {
  compressImage,
  compressToSize
};
