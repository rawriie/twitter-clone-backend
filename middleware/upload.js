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


const uploadToCloudinary = async (buffer, isPfp) => {
  try{
    const res = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "image" }, 
        (error, uploadResult) => {
          if (error) {
              return reject(error);
          }
          resolve(uploadResult);
      })
  
      streamifier.createReadStream(buffer).pipe(stream);
      
     
    });

    console.log(res);
    if(isPfp){
      const optimizeUrl = cloudinary.v2.url(res.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500
      });

      return optimizeUrl;
    }

    return res.secure_url
  }
  catch(err){
    console.error(err);
  }
};
  
module.exports = { upload, uploadToCloudinary };



