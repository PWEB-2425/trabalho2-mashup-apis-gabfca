require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

// DB connection
require('./config/db');

// CORS middleware - must be before routes!
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: isProduction,          // true only on production (HTTPS)
    sameSite: isProduction ? 'none' : 'lax',  // 'none' requires secure, so 'lax' for dev HTTP
  }
}));

// Attach user info from session to req.user safely
app.use((req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      req.user = {
        id: req.session.userId,
        username: req.session.username,
      };
    } else {
      req.user = null;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Import routes
const { authRouter, ensureAuthenticated } = require('./routes/auth');
const friendsRouter = require('./routes/friends');  // Import the friends routes
app.use('/api', authRouter);
app.use('/api', require('./routes/trailer-provider'));
app.use('/api', require('./routes/track-provider'));
app.use('/api', require('./routes/mixer'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/save'));
app.use('/api', friendsRouter); // Use the friends routes

// 404 handler
app.use((req, res, next) => {
  res.status(404).send('404 - Not Found');
});

// Global error handler - sends CORS headers even on error
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Send CORS headers on errors to prevent CORS failures in browser
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(500).send('Something broke!');
});

// Create default user if not exists
async function createDefaultUser() {
  const User = require('./models/User');
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('Default user already exists');
      return;
    }
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({ username: 'admin', password: hashedPassword });
    await user.save();
    console.log('Default user created');
  } catch (err) {
    console.error('Error creating default user:', err);
  }
}

// Patch existing users to add `mixes` field if missing
async function patchUsersAddMixesField() {
  const User = require('./models/User');
  try {
    const result = await User.updateMany(
      { mixes: { $exists: false } }, // users without mixes field
      { $set: { mixes: [] } }        // add empty array field mixes
    );
    console.log(`Patch applied: ${result.modifiedCount} user(s) updated with mixes field.`);
  } catch (err) {
    console.error('Error patching users with mixes field:', err);
  }
}

// Patch existing users to add `friends` field if missing
async function patchUsersAddFriendsField() {
  const User = require('./models/User');
  try {
    const result = await User.updateMany(
      { friends: { $exists: false } }, // users without friends field
      { $set: { friends: [] } }        // add empty array field friends
    );
    console.log(`Patch applied: ${result.modifiedCount} user(s) updated with friends field.`);
  } catch (err) {
    console.error('Error patching users with friends field:', err);
  }
}

// Start server once DB connected
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected');
  await createDefaultUser();

  // Patch all existing users
  await patchUsersAddMixesField();
  await patchUsersAddFriendsField();  // Ensure friends field is available

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
