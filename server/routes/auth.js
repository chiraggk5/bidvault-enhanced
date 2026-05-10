const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, adminSecret } = req.body;
    const configuredAdminSecret = process.env.ADMIN_SECRET;

    if (!email || !password || !username)
      return res.status(400).json({ error: 'Email, password, and username are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (username.length < 3)
      return res.status(400).json({ error: 'Username must be at least 3 characters' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(409).json({
        error: existing.email === email ? 'Email already registered' : 'Username already taken'
      });

    const isAdmin = Boolean(
      configuredAdminSecret &&
      adminSecret &&
      adminSecret === configuredAdminSecret
    );
    const user = await User.create({ email, password, username, isAdmin });
    const token = makeToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = makeToken(user._id);
    res.json({ token, user });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
