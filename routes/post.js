const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Like post
router.post('/post/:id/like', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const email = req.session.user?.email;
  
      if (!email) return res.redirect('/login');
  
      // Toggle like
      if (!post.likes.includes(email)) {
        post.likes.push(email);
      } else {
        post.likes = post.likes.filter(e => e !== email);
      }
  
      await post.save();
      res.json({ likeCount: post.likes.length });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error liking post");
    }
  });
  
  // Comment on post
  router.post('/post/:id/comment', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const commentText = req.body.comment;
      const user = req.session.user;
  
      if (!user) return res.redirect('/login');
  
      if (commentText.trim()) {
        post.comments.push({ user: user.name, text: commentText.trim() });
        await post.save();
      }
  
    //   res.redirect('/home');
    res.json({okay:200});
    } catch (err) {
      console.error(err);
      res.status(500).send("Error commenting on post");
    }
  });

module.exports = router;
