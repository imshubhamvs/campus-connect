const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
});

const postSchema = new mongoose.Schema({
  authorEmail: String,
  imageUrl: String,
  caption: String,
  likes: [String],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Post', postSchema);
