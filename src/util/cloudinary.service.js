const cloudinary = require('cloudinary').v2;

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

module.exports = {
    uploadProductImageToCloudinary
}