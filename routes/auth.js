const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const { upload } = require('../config/cloudinaryConfig');
// storage
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
// GET Sign In
router.get('/signin', (req, res) => {
  res.render('pages/signin', { title: 'Sign In' });
});

router.post('/signin', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, surname, email, bio, branch, passingOutYear, password } = req.body;

    const profilePhotoUrl = req.file?.path || ''; 
    // Generate file extension and clean filename
    // const ext = path.extname(req.file.originalname);
    // const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    // const profilePhotoPath = `images/profiles/${sanitizedEmail}${ext}`;

    // // Move uploaded file to public/images/profiles with the new filename
    // const destPath = path.join(__dirname, '..', 'public', profilePhotoPath);
    // await fs.promises.rename(req.file.path, destPath);

    // Create new user with initialized followers/following
    const user = new User({
      name,
      surname,
      email,
      profilePhoto: profilePhotoUrl,
      bio,
      branch,
      passingOutYear,
      password,
      followers: [],
      following: []
    });

    await user.save();
    req.session.user = user;
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});



// GET Login
router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    req.session.user = user;
    res.redirect('/profile');
  } else {
    res.send('Invalid email or password');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
