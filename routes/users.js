
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated, isAdmin } = require('./auth'); 

router.get('/users', ensureAuthenticated, async (req, res, next) => {
  try {
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

router.get('/users/:userId/mixes', ensureAuthenticated, async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
  
      const user = await User.findById(userId).select('mixes username');
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      let mixes = user.mixes;
  
      if (req.user._id.toString() !== userId) {
        mixes = mixes.filter(mix => mix.isPublic);
      }
  
      res.json({ username: user.username, mixes });
    } catch (err) {
      next(err);
    }
  });
  
  