const express = require('express');
const axios = require('axios');
const router = express.Router();

const { ensureAuthenticated } = require('./auth');

async function getSongPreviewsByName(songName, artistName = null) {
  const response = await axios.get('https://itunes.apple.com/search', {
    params: {
      term: songName,
      media: 'music',
      entity: 'song',
      limit: 100,
    },
  });

  const results = response.data.results || [];
  if (results.length === 0) return [];

  // Normalize input for comparison
  const normalize = str => str.toLowerCase().trim();

  // Filter exact matches for track name, and optionally by artist
  const exactMatches = results.filter(track => {
    const trackMatch = normalize(track.trackName) === normalize(songName);
    if (!trackMatch) return false;

    if (artistName) {
      return normalize(track.artistName).includes(normalize(artistName));
    }
    return true;
  });

  // If no exact matches, fallback to returning top 5 results anyway (you can adjust)
  const tracksToReturn = exactMatches.length > 0 ? exactMatches : results.slice(0, 5);

  // Map to only include necessary info (name, artist, preview URL, artwork)
  return tracksToReturn.map(track => ({
    trackName: track.trackName,
    artistName: track.artistName,
    previewUrl: track.previewUrl,
  }));
}

router.get('/music/preview', ensureAuthenticated, async (req, res) => {
  const { songName, artistName } = req.query;
  if (!songName) {
    return res.status(400).json({ error: 'songName query parameter required' });
  }

  try {
    const songPreviews = await getSongPreviewsByName(songName, artistName);

    if (songPreviews.length === 0) {
      return res.status(404).json({ error: 'No songs found with that name' });
    }

    res.json(songPreviews);
  } catch (error) {
    console.error('Error fetching song previews:', error.message);
    res.status(500).json({ error: 'Failed to fetch song previews' });
  }
});

module.exports = router;
