// config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: 'dmlisflzp',
    api_key: '533315728651319',
    api_secret: 'mECOorqdgveFPc4P1FS1vAwmceI'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const email = req.body.email || 'user';
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const ext = file.originalname.split('.').pop();
    return {
      folder: 'profiles',
      format: ext,
      public_id: sanitizedEmail
    };
  }
});

const upload = multer({ storage });

module.exports = { upload };
