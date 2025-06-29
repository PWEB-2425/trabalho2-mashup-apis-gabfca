const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.userId) return next();

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.redirect('/login');
  }

router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: { username: req.session.username || 'Guest' }
  });
});

router.post('/login', authController.login);
router.post('/register', authController.register); 
router.post('/logout', authController.logout);

router.get('/session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ user: { username: req.session.username } });
  } else {
    res.json({ user: null });
  }
});

module.exports = {
  authRouter: router,
  ensureAuthenticated
};