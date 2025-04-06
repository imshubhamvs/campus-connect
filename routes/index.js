const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

// GET home feed
router.get("/", async (req, res) => {
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

module.exports = router;
