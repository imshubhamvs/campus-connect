// const express = require('express');
// const path = require('path');
// const expressLayouts = require('express-ejs-layouts');
// const mongoose = require('mongoose');
// const session = require('express-session');

// const app = express();

// // Set EJS as view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Use express-ejs-layouts
// app.use(expressLayouts);
// app.set('layout', 'layout'); // This means views/layout.ejs will be used as the layout

// // Middleware
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.urlencoded({ extended: true }));

// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusConnect', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }).then(() => console.log('✅ MongoDB connected'))
//     .catch(err => console.log(err));
  
//   // EJS and Middleware
//   app.set('view engine', 'ejs');
//   app.set('views', path.join(__dirname, 'views'));
//   app.use(express.static(path.join(__dirname, 'public')));
//   app.use(express.urlencoded({ extended: true }));
  
//   // Session
//   app.use(session({
//     secret: 'secret-key',
//     resave: false,
//     saveUninitialized: false
//   }));
 


  



// // Sample data for posts
// const posts = [
//   {
//     userPhoto: '/images/user1.jpg',
//     username: 'john_doe',
//     imageUrl: 'https://cdn.prod.website-files.com/5b3dd54182ecae4d1602962f/609e33e18c5000af6211f094_HR%20Hackathon%20-%20Section%202.jpg',
//     caption: 'Had a great time at the hackathon! 🧠⚡ #HackCampus'
//   },
//   {
//     userPhoto: '/images/user1.jpg',
//     username: 'john_doe',
//     imageUrl: 'https://marketplace.canva.com/EAEMDgoltYE/1/0/1600w/canva-angry-cat-photo-and-text-meme-km1G_BD6MC8.jpg',
//     caption: 'Just vibing with the project cat 😼 #CatMode'
//   }
// ];

// // Routes
// // app.get('/', (req, res) => {
// //   res.render('pages/home', {
// //     title: 'Home',
// //     posts
// //   });
// // });
// app.get('/profile', (req, res) => {
//     if (!req.session.user) return res.redirect('/login');
//     res.render('pages/profile', {
//       title: 'Your Profile',
//       user: req.session.user
//     });
//   });
//   // search
//   app.get('/search', (req, res) => {
//     if (!req.session.user) return res.redirect('/login');
//     res.render('pages/search', { title: 'Search', user: req.session.user });
//   });
  

//   // Routes
//   const homeRoute = require('./routes/index')
//   app.use(homeRoute);
//   const authRoutes = require('./routes/auth');
//   app.use(authRoutes);
  
//   const userRoutes = require('./routes/user');
//   app.use(userRoutes);

//   const postsRoutes = require('./routes/post');
//   app.use(postsRoutes);

//   const messageRoutes = require('./routes/message')
//   app.use(messageRoutes);

// // Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });

const mongoose = require('mongoose');

const uri = "mongodb+srv://user1:wtl@1234@cluster0.nssckeg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Ping the database to confirm connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
