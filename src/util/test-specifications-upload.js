// Test script để upload specifications cho Toyota Fortuner
const fs = require('fs');
const path = require('path');

// ID của Toyota Fortuner từ URL
const productId = '68930c286392a0da40b1735';

// Đường dẫn ảnh specifications (giả sử có trong public/images)
const specsImagePath = path.join(__dirname, '../../../NIAD-XCT/public/images/test3.png');

// Kiểm tra xem file có tồn tại không
if (fs.existsSync(specsImagePath)) {
  console.log('✅ Specifications image found:', specsImagePath);
  console.log('📏 File size:', (fs.statSync(specsImagePath).size / 1024 / 1024).toFixed(2), 'MB');
  
  console.log('\n🔧 To upload this image as specifications:');
  console.log('1. Start the backend server: npm start');
  console.log('2. Use Postman or curl to send POST request:');
  console.log(`   PUT http://localhost:9999/api/car/specifications/${productId}`);
  console.log('   Form-data: specifications = [upload the file]');
  console.log('\n⚡ Or use curl command:');
  console.log(`curl -X PUT http://localhost:9999/api/car/specifications/${productId} \\`);
  console.log(`  -F "specifications=@${specsImagePath}"`);
  
} else {
  console.log('❌ Specifications image not found:', specsImagePath);
  console.log('📝 Available images in public/images:');
  
  const imagesDir = path.join(__dirname, '../../../NIAD-XCT/public/images');
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir).filter(f => f.match(/\.(jpg|jpeg|png|gif)$/i));
    files.forEach(file => {
      const filePath = path.join(imagesDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    });
  }
}
