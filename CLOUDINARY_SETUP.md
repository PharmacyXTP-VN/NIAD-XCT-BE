# Cloudinary Image Management Setup

## 🔧 Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Folder Structure on Cloudinary

Images will be organized as:
```
image-management/
├── banner/
├── partner/
├── advantage/
├── page-banner/
└── about/
```

## ✨ Features

### 🎯 **Auto Compression**
- **Target**: 9MB (Cloudinary free tier limit)
- **Smart quality**: Auto-optimize
- **Auto format**: WebP/JPEG based on browser support

### 🔄 **Backward Compatibility**
- Supports both Cloudinary and local images
- Auto-detects image source for delete operations
- Seamless migration from local to cloud

### 🚀 **Benefits**
- ✅ **Deploy Safe**: No file system dependencies
- ✅ **CDN Fast**: Global edge caching
- ✅ **Auto Optimize**: Format + quality optimization
- ✅ **Scalable**: No storage limits on server

## 🔄 Migration (Optional)

To migrate existing local images to Cloudinary:

```javascript
// In migrate-to-cloudinary.js
// Uncomment the last line and run:
const { migrateImagesToCloudinary } = require('./src/util/migrate-to-cloudinary');
migrateImagesToCloudinary();
```

## 📊 Cloudinary Dashboard

Monitor usage at: https://cloudinary.com/console

- **Free Tier**: 25 credits/month
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month

## 🛠️ Testing

1. Upload image via admin panel
2. Check image displays correctly
3. Verify image URL contains `cloudinary.com`
4. Test update/delete operations

Now all new images will automatically upload to Cloudinary! 🎉
