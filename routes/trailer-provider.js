require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

const { ensureAuthenticated } = require('./auth'); 

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in the environment variables.');
}

async function searchMoviesByName(movieName) {
  const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
    params: {
      api_key: TMDB_API_KEY,
      query: movieName,
      include_adult: false,
      language: 'en-US',
      page: 1
    }
  });

  return response.data.results || [];
}

async function getTrailerByMovieId(movieId) {
  const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
    params: {
      api_key: TMDB_API_KEY,
      language: 'en-US'
    }
  });

  const videos = response.data.results || [];
  const trailer = videos.find(
    vid => vid.type === 'Trailer' && vid.site === 'YouTube'
  );

  return trailer || null;
}

router.get('/trailers/search', ensureAuthenticated, async (req, res) => {
  const movieName = req.query.movieName;
  if (!movieName) {
    return res.status(400).json({ error: 'movieName query parameter required' });
  }

  try {
    const movies = await searchMoviesByName(movieName);

    if (!movies.length) {
      return res.status(404).json({ error: 'No movies found with that name' });
    }

    const movieResults = [];
    const maxResults = 5; 
    
    for (let i = 0; i < Math.min(movies.length, maxResults); i++) {
      const movie = movies[i];
      try {
        const trailer = await getTrailerByMovieId(movie.id);
        
        if (trailer) {
          movieResults.push({
            movieTitle: movie.title,
            releaseDate: movie.release_date,
            overview: movie.overview,
            popularity: movie.popularity,
            posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            youtubeVideoId: trailer.key,
            youtubeUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
            trailerName: trailer.name
          });
        }
      } catch (error) {
        console.error(`Error fetching trailer for movie ${movie.id}:`, error.message);
        // Continue with next movie even if one fails
      }
    }

    if (!movieResults.length) {
      return res.status(404).json({ error: 'No trailers found for any matching movies' });
    }

    res.json({
      count: movieResults.length,
      results: movieResults
    });
  } catch (error) {
    console.error('Error fetching trailers:', error.message);
    res.status(500).json({ error: 'Failed to fetch trailers' });
  }
});

module.exports = router;