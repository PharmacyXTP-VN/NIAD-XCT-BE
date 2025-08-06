const fs = require('fs');
const path = require('path');

/**
 * Script để xóa tất cả ảnh cũ trong thư mục public/images
 * Chỉ chạy sau khi đã migrate thành công lên Cloudinary
 */
const cleanupOldImages = () => {
  try {
    console.log('🧹 Starting cleanup of old images...');
    
    // Đường dẫn đến thư mục public/images của frontend
    const getFrontendPublicPath = () => {
      return path.join(__dirname, '../../../NIAD-XCT/public/images');
    };
    
    const imagesPath = getFrontendPublicPath();
    
    if (!fs.existsSync(imagesPath)) {
      console.log('❌ Images directory not found:', imagesPath);
      return;
    }
    
    let deletedCount = 0;
    let totalSize = 0;
    
    // Hàm đệ quy để xóa tất cả file trong thư mục
    const deleteFilesInDirectory = (dirPath) => {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Đệ quy vào thư mục con
          deleteFilesInDirectory(itemPath);
          
          // Xóa thư mục nếu rỗng
          try {
            fs.rmdirSync(itemPath);
            console.log(`📁 Removed empty directory: ${itemPath}`);
          } catch (err) {
            // Thư mục không rỗng, bỏ qua
          }
        } else {
          // Xóa file
          const fileSizeMB = (stat.size / 1024 / 1024).toFixed(2);
          totalSize += stat.size;
          
          fs.unlinkSync(itemPath);
          console.log(`🗑️  Deleted: ${item} (${fileSizeMB}MB)`);
          deletedCount++;
        }
      }
    };
    
    deleteFilesInDirectory(imagesPath);
    
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`🗑️  Deleted ${deletedCount} files`);
    console.log(`💾 Freed up ${totalSizeMB}MB of storage`);
    
    // Tạo file .gitkeep để giữ thư mục images
    const gitkeepPath = path.join(imagesPath, '.gitkeep');
    fs.writeFileSync(gitkeepPath, '');
    console.log('📝 Created .gitkeep to preserve images directory structure');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Xác nhận trước khi chạy
console.log('⚠️  This will DELETE ALL images in public/images directory!');
console.log('⚠️  Make sure all images have been migrated to Cloudinary first!');
console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...');

setTimeout(() => {
  cleanupOldImages();
}, 5000);

module.exports = {
  cleanupOldImages
};
