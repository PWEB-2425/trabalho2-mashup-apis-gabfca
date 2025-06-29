const User = require('../models/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {

      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {

      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    return res.json({ message: 'Login successful', user: { username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {

      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      const newUser = new User({ username, password });
      await newUser.save();

      req.session.userId = newUser._id;
      req.session.username = newUser.username;

      return res.status(201).json({
        message: 'Registration successful',
        user: { username: newUser.username }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
};