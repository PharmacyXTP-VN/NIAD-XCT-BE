const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const { uploadImageToCloudinary } = require('./cloudinary.service');
const Car = require('../models/product.model');

/**
 * Migration script để migrate specifications images sang Cloudinary
 */
const migrateSpecificationsToCloudinary = async () => {
  try {
    console.log('🚀 Starting migration of specifications images to Cloudinary...');
    
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
    console.log('📦 Connected to MongoDB');
    
    // Lấy tất cả sản phẩm có specifications
    const products = await Car.find({ 
      specifications: { $exists: true, $ne: "" } 
    });
    
    console.log(`Found ${products.length} products with specifications`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const product of products) {
      try {
        // Bỏ qua nếu đã là Cloudinary URL
        if (product.specifications.includes('cloudinary.com')) {
          console.log(`⏭️  Skipping (already on Cloudinary): ${product.name}`);
          continue;
        }
        
        // Đường dẫn đến file local
        const getFrontendPublicPath = () => {
          return path.join(__dirname, '../../../NIAD-XCT/public');
        };
        
        const relativePath = product.specifications.startsWith('/') ? 
          product.specifications.substring(1) : product.specifications;
        const localPath = path.join(getFrontendPublicPath(), relativePath);
        
        console.log(`Checking file: ${localPath}`);
        
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(localPath)) {
          console.log(`❌ Specifications file not found for ${product.name}: ${localPath}`);
          failed++;
          continue;
        }
        
        // Đọc file
        const fileBuffer = fs.readFileSync(localPath);
        const fileName = `${product.name.toLowerCase().replace(/\s+/g, '-')}-specs`;
        
        console.log(`📤 Uploading specifications for: ${product.name} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
        
        // Upload lên Cloudinary với folder 'specifications'
        const cloudinaryUrl = await uploadImageToCloudinary(fileBuffer, 'specifications', fileName);
        
        // Cập nhật database
        product.specifications = cloudinaryUrl;
        await product.save();
        
        console.log(`✅ Migrated specifications for: ${product.name} -> ${cloudinaryUrl}`);
        migrated++;
        
        // Xóa file local sau khi migrate thành công
        fs.unlinkSync(localPath);
        console.log(`🗑️  Removed local file: ${localPath}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate specifications for ${product.name}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Specifications migration completed!`);
    console.log(`✅ Successfully migrated: ${migrated} specifications`);
    console.log(`❌ Failed: ${failed} specifications`);
    
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Specifications migration failed:', error);
  }
};

// Chạy migration
const runSpecsMigration = async () => {
  await migrateSpecificationsToCloudinary();
};

runSpecsMigration().catch(console.error);

module.exports = {
  migrateSpecificationsToCloudinary
};
