const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: { type: String, unique: true },
  profilePhoto: String,
  bio: String,
  branch: String,
  passingOutYear: Number,
  password: String,
  followers: [String], // list of user emails
  following: [String]  // list of user emails
});

module.exports = mongoose.model('User', userSchema);
