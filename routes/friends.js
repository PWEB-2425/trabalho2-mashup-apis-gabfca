const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('./auth');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper to handle DB lookup and errors
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Add a friend
router.post('/friend/add/:friendId', ensureAuthenticated, async (req, res) => {
  const { friendId } = req.params;
  const userId = req.session.userId;

  try {
    // Input validation
    if (!friendId) return res.status(400).json({ error: 'Invalid friend ID' });

    const user = await getUserById(userId);
    const friend = await getUserById(friendId);

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    user.friends.push(friendId);
    await user.save();

    friend.friends.push(user._id);
    await friend.save();

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error.message);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Remove a friend
router.delete('/friend/remove/:friendId', ensureAuthenticated, async (req, res) => {
  const { friendId } = req.params;
  const userId = req.session.userId;

  try {
    // Input validation
    if (!friendId) return res.status(400).json({ error: 'Invalid friend ID' });

    const user = await getUserById(userId);
    const friendIndex = user.friends.indexOf(friendId);

    if (friendIndex === -1) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    user.friends.splice(friendIndex, 1);
    await user.save();

    const friend = await getUserById(friendId);
    const friendIndexInFriend = friend.friends.indexOf(user._id);
    if (friendIndexInFriend !== -1) {
      friend.friends.splice(friendIndexInFriend, 1);
      await friend.save();
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error.message);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Get friend list
router.get('/friend/list', ensureAuthenticated, async (req, res) => {
  const userId = req.session.userId;

  try {
    const user = await getUserById(userId);
    
    const friends = await User.find({ _id: { $in: user.friends } });
    console.log(friends)
    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error.message);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

module.exports = router;
