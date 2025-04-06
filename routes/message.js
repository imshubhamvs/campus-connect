const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// GET all users you've chatted with
router.get('/messages', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const email = req.session.user.email;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: email },
          { receiver: email }
        ]
      }
    },
    {
      $project: {
        contact: {
          $cond: [
            { $eq: ["$sender", email] },
            "$receiver",
            "$sender"
          ]
        },
        content: 1,
        timestamp: 1
      }
    },
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: "$contact",
        lastMessage: { $first: "$content" },
        lastTimestamp: { $first: "$timestamp" }
      }
    },
    {
      $sort: { lastTimestamp: -1 }
    }
  ]);

  // Get user details
  const users = await User.find({ email: { $in: conversations.map(c => c._id) } });

  const chats = conversations.map(conv => {
    const user = users.find(u => u.email === conv._id);
    return {
      email: conv._id,
      name: user?.name || conv._id,
      photo: user?.profilePhoto || 'default.jpg',
      lastMessage: conv.lastMessage,
      time: conv.lastTimestamp
    };
  });

  res.render('messages/inbox', { chats });
});

// GET chat with specific user (💬 individual chat page)
router.get('/messages/:email', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const currentUser = req.session.user.email;
  const otherUser = req.params.email;

  // Get chat history
  const messages = await Message.find({
    $or: [
      { sender: currentUser, receiver: otherUser },
      { sender: otherUser, receiver: currentUser }
    ]
  }).sort({ timestamp: 1 });

  const user = await User.findOne({ email: otherUser });

  // ✅ Get recent chat list for sidebar (same logic as above)
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: currentUser },
          { receiver: currentUser }
        ]
      }
    },
    {
      $project: {
        contact: {
          $cond: [
            { $eq: ["$sender", currentUser] },
            "$receiver",
            "$sender"
          ]
        },
        content: 1,
        timestamp: 1
      }
    },
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: "$contact",
        lastMessage: { $first: "$content" },
        lastTimestamp: { $first: "$timestamp" }
      }
    },
    {
      $sort: { lastTimestamp: -1 }
    }
  ]);

  const users = await User.find({ email: { $in: conversations.map(c => c._id) } });

  const chats = conversations.map(conv => {
    const u = users.find(user => user.email === conv._id);
    return {
      email: conv._id,
      name: u?.name || conv._id,
      photo: u?.profilePhoto || 'default.jpg',
      lastMessage: conv.lastMessage,
      time: conv.lastTimestamp
    };
  });

  res.render('messages/chat', {
    user,
    messages,
    myEmail: currentUser,
    chats // ✅ This fixes the ReferenceError
  });
});

// POST send message
router.post('/messages/:email', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const sender = req.session.user.email;
  const receiver = req.params.email;
  const content = req.body.message;

  const newMsg = new Message({ sender, receiver, content });
  await newMsg.save();

  res.redirect(`/messages/${receiver}`);
});

module.exports = router;
