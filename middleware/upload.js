const multer = require('multer');
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');


const storage = multer.memoryStorage();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const upload = multer({ 
  storage: storage
 });


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
  
      streamifier.createReadStream(buffer).pipe(stream);
    });
};
  
module.exports = { upload, uploadToCloudinary };



