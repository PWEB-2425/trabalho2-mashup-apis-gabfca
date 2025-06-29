const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('./auth');
const User = require('../models/User');

router.post('/mix/save', ensureAuthenticated, async (req, res) => {
  const {
    youtubeVideoId,
    videoStart,
    videoEnd,
    audioPreviewUrl,
    audioStart,
    audioEnd,
    title,
    description,
    isPublic
  } = req.body;

  if (
    !youtubeVideoId || videoStart == null || videoEnd == null ||
    !audioPreviewUrl || audioStart == null || audioEnd == null
  ) {
    return res.status(400).json({ error: 'Missing required mix fields' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.mixes.push({
      youtubeVideoId,
      videoStart,
      videoEnd,
      audioPreviewUrl,
      audioStart,
      audioEnd,
      title,
      description,
      isPublic: isPublic !== false
    });

    await user.save();
    res.json({ message: 'Mix saved successfully' });
  } catch (error) {
    console.error('Error saving mix:', error.message);
    res.status(500).json({ error: 'Failed to save mix' });
  }
});

router.get('/mix/public', ensureAuthenticated, async (req, res) => {
  try {

    const allUsers = await User.find({});

    const publicMixes = [];

    allUsers.forEach(user => {
      user.mixes.forEach(mix => {
        if (mix.isPublic) {
          publicMixes.push({
            ownerUsername: user.username,
            mixId: mix._id,
            youtubeVideoId: mix.youtubeVideoId,
            videoStart: mix.videoStart,
            videoEnd: mix.videoEnd,
            audioPreviewUrl: mix.audioPreviewUrl,
            audioStart: mix.audioStart,
            audioEnd: mix.audioEnd,
            title: mix.title,
            description: mix.description,
          });
        }
      });
    });

    res.json(publicMixes);
  } catch (error) {
    console.error('Error fetching public mixes:', error);
    res.status(500).json({ error: 'Failed to fetch public mixes' });
  }
});

router.get('/mix/mine', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('mixes');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Convert each mix to a plain object and add the mixId
    const userMixes = user.mixes.map(mix => ({
      mixId: mix._id,
      youtubeVideoId: mix.youtubeVideoId,
      videoStart: mix.videoStart,
      videoEnd: mix.videoEnd,
      audioPreviewUrl: mix.audioPreviewUrl,
      audioStart: mix.audioStart,
      audioEnd: mix.audioEnd,
      title: mix.title,
      description: mix.description,
      isPublic: mix.isPublic
    }));

    res.json(userMixes);
  } catch (error) {
    console.error('Error fetching user mixes:', error);
    res.status(500).json({ error: 'Failed to fetch your mixes' });
  }
});

router.delete('/mix/:mixId', ensureAuthenticated, async (req, res) => {
  const { mixId } = req.params;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const mixIndex = user.mixes.findIndex(mix => mix._id.toString() === mixId);

    if (mixIndex === -1) {
      return res.status(404).json({ error: 'Mix not found' });
    }

    user.mixes.splice(mixIndex, 1);

    await user.save();

    res.json({ message: 'Mix deleted successfully' });
  } catch (error) {
    console.error('Error deleting mix:', error);
    res.status(500).json({ error: 'Failed to delete mix' });
  }
});

module.exports = router;