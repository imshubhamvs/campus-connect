// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // GET user profile by email
// router.get('/user/:email', async (req, res) => {
//   try {
//     const loggedInUser = req.session.user;
//     if (!loggedInUser) return res.redirect('/login');

//     const targetEmail = req.params.email;
//     const targetUser = await User.findOne({ email: targetEmail });

//     if (!targetUser) return res.status(404).send("User not found");

//     const isFollowing = targetUser.followers.includes(loggedInUser.email);

//     res.render('pages/userProfile', {
//       title: `${targetUser.name} Profile`,
//       user: loggedInUser,
//       targetUser,
//       isFollowing
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });

// // POST follow/unfollow user
// router.post('/follow/:email', async (req, res) => {
//     try {
//       const loggedInUser = await User.findOne({ email: req.session.user.email });
//       const targetEmail = req.params.email;
  
//       if (!loggedInUser || loggedInUser.email === targetEmail) return res.redirect('/');
  
//       const targetUser = await User.findOne({ email: targetEmail });
  
//       const isFollowing = loggedInUser.following.includes(targetEmail);
  
//       if (isFollowing) {
//         // Unfollow
//         loggedInUser.following = loggedInUser.following.filter(e => e !== targetEmail);
//         targetUser.followers = targetUser.followers.filter(e => e !== loggedInUser.email);
//       } else {
//         // Follow
//         loggedInUser.following.push(targetEmail);
//         targetUser.followers.push(loggedInUser.email);
//       }
  
//       await loggedInUser.save();
//       await targetUser.save();
  
//       req.session.user = loggedInUser; // update session
//       res.redirect(`/user/${targetEmail}`);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Error: ' + err.message);
//     }
//   });
//   module.exports = router; 


const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const User = require('../models/User');
const Post = require('../models/Post');

// Configure Multer for post image uploads
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure your Cloudinary credentials
cloudinary.config({
  cloud_name: 'dmlisflzp',
  api_key: '533315728651319',
  api_secret: 'mECOorqdgveFPc4P1FS1vAwmceI'
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const sanitizedEmail = req.session?.user?.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'user';
    const uniqueSuffix = Date.now();
    const ext = file.originalname.split('.').pop();

    return {
      folder: 'posts', // Cloudinary folder name
      format: ext,     // Optional: keep original extension
      public_id: `${sanitizedEmail}_${uniqueSuffix}`
    };
  }
});

const upload = multer({ storage });

// module.exports = { upload };

// ✅ GET user profile by email
router.get('/user/:email', async (req, res) => {
  try {
    const loggedInUser = req.session.user;
    if (!loggedInUser) return res.redirect('/login');

    const targetEmail = req.params.email;
    const targetUser = await User.findOne({ email: targetEmail });

    if (!targetUser) return res.status(404).send("User not found");

    const isFollowing = targetUser.followers.includes(loggedInUser.email);

    const posts = await Post.find({ authorEmail: targetEmail }).sort({ createdAt: -1 });

    res.render('pages/userProfile', {
      title: `${targetUser.name} Profile`,
      user: loggedInUser,
      targetUser,
      isFollowing,
      posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ✅ POST follow/unfollow user
router.post('/follow/:email', async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ email: req.session.user.email });
    const targetEmail = req.params.email;

    if (!loggedInUser || loggedInUser.email === targetEmail) return res.redirect('/');

    const targetUser = await User.findOne({ email: targetEmail });

    const isFollowing = loggedInUser.following.includes(targetEmail);

    if (isFollowing) {
      loggedInUser.following = loggedInUser.following.filter(e => e !== targetEmail);
      targetUser.followers = targetUser.followers.filter(e => e !== loggedInUser.email);
    } else {
      loggedInUser.following.push(targetEmail);
      targetUser.followers.push(loggedInUser.email);
    }

    await loggedInUser.save();
    await targetUser.save();

    req.session.user = loggedInUser;
    res.redirect(`/user/${targetEmail}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});

// ✅ GET Add Post Page
router.get('/add-post', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('pages/add-post', { title: 'Add Post', user: req.session.user });
});

// ✅ POST Add New Post
router.post('/add-post', upload.single('image'), async (req, res) => {
    try {
      if (!req.session.user) return res.redirect('/login');
  
      const { caption } = req.body;
      const imagePath = req.file?.path;
      if (!imagePath) {
        return res.status(400).send('Image upload failed.');
      } 
  
      // Get logged in user details
    
      const currentUser = await User.findOne({ email: req.session.user.email });
  
      const newPost = new Post({
        caption,
        imageUrl: imagePath,
        authorEmail: req.session.user.email,         // Post schema stores email of owner
        likes: [],
        comments: []
      });
  
      await newPost.save();
  
      res.redirect(`/user/${currentUser.email}`);
    } catch (err) {
      console.error('Post creation error:', err);
      res.status(500).send('Failed to create post');
    }
  });

// GET /search-users?q=
router.get('/search-users', async (req, res) => {
    try {
      const query = req.query.q?.toLowerCase() || '';
      if (!query) return res.json([]);
  
      const users = await User.find({
        $or: [
          { name: new RegExp(query, 'i') },
          { surname: new RegExp(query, 'i') }
        ]
      }).limit(10);
  
      const filteredUsers = users.map(user => ({
        email: user.email,
        name: user.name,
        surname: user.surname,
        profilePhoto: user.profilePhoto
      }));
  
      res.json(filteredUsers);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
module.exports = router;
