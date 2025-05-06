const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout'); // This means views/layout.ejs will be used as the layout

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user1:shubham3011@campus.81pgaa9.mongodb.net/?retryWrites=true&w=majority&appName=campus', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.log(err));
  
  // EJS and Middleware

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: true }));
  
  // Session
  app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
  }));
 

const User = require("./models/User");
const Post = require("./models/Post");

// GET home feed
app.get("/", async (req, res) => {
  try {
    const loggedInUser = req.session.user;
    if (!loggedInUser) return res.redirect("/login");
    const currentUser = await User.findOne({ email: req.session.user.email });

    const followingEmails = currentUser.following;

    // Get posts from followed users
    const posts = await Post.find({ authorEmail: { $in: followingEmails } }).sort({
      createdAt: -1,
    });

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const postOwner = await User.findOne({ email: post.authorEmail });
        return {
          ...post._doc,
          userPhoto: postOwner.profilePhoto,
          username: postOwner.name,
        };
      })
    );

    res.render("pages/home", {
      title: "Home Feed",
      user: currentUser,
      posts: enrichedPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('pages/profile', {
      title: 'Your Profile',
      user: req.session.user
    });
  });
  // search
  app.get('/search', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('pages/search', { title: 'Search', user: req.session.user });
  });
  

  // Routes
  const homeRoute = require('./routes/index')
  app.use(homeRoute);

  const authRoutes = require('./routes/auth');
  app.use(authRoutes);
  
  const userRoutes = require('./routes/user');
  app.use(userRoutes);

  const postsRoutes = require('./routes/post');
  app.use(postsRoutes);

  const messageRoutes = require('./routes/message')
  app.use(messageRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


