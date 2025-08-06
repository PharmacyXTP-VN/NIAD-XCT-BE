const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const ImageSetting = require('../models/image.setting.model');
const { uploadImageToCloudinary } = require('../util/cloudinary.service');

/**
 * Migration script to move existing local images to Cloudinary
 * Run this once after updating to Cloudinary
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const migrateImagesToCloudinary = async () => {
  try {
    console.log('🚀 Starting migration of local images to Cloudinary...');
    
    // Lấy tất cả ảnh hiện tại
    const images = await ImageSetting.find({});
    console.log(`Found ${images.length} images to migrate`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const image of images) {
      try {
        // Bỏ qua nếu đã là Cloudinary URL
        if (image.url.includes('cloudinary.com')) {
          console.log(`⏭️  Skipping (already on Cloudinary): ${image.url}`);
          continue;
        }
        
        // Đường dẫn đến file local
        const getFrontendPublicPath = () => {
          return path.join(__dirname, '../../../NIAD-XCT/public');
        };
        
        const relativePath = image.url.startsWith('/') ? image.url.substring(1) : image.url;
        const localPath = path.join(getFrontendPublicPath(), relativePath);
        
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(localPath)) {
          console.log(`❌ File not found: ${localPath}`);
          failed++;
          continue;
        }
        
        // Đọc file
        const fileBuffer = fs.readFileSync(localPath);
        const fileName = path.basename(localPath);
        
        console.log(`📤 Uploading: ${fileName} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
        
        // Upload lên Cloudinary
        const cloudinaryUrl = await uploadImageToCloudinary(fileBuffer, image.type, fileName);
        
        // Cập nhật database
        image.url = cloudinaryUrl;
        await image.save();
        
        console.log(`✅ Migrated: ${fileName} -> ${cloudinaryUrl}`);
        migrated++;
        
        // Xóa file local sau khi migrate thành công
        fs.unlinkSync(localPath);
        console.log(`🗑️  Removed local file: ${localPath}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${image.url}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully migrated: ${migrated} images`);
    console.log(`❌ Failed: ${failed} images`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Uncomment để chạy migration
const runMigration = async () => {
  await connectToDatabase();
  await migrateImagesToCloudinary();
  await mongoose.connection.close();
  console.log('👋 Disconnected from MongoDB');
};

runMigration().catch(console.error);

module.exports = {
  migrateImagesToCloudinary
};
