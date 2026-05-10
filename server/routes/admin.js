const express = require('express');
const Auction = require('../models/Auction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

// All admin routes require auth + admin
router.use(auth, adminOnly);

// GET /api/admin/stats — dashboard overview
router.get('/stats', async (req, res) => {
  try {
    const [totalAuctions, activeAuctions, endedAuctions, totalUsers, allAuctions] = await Promise.all([
      Auction.countDocuments(),
      Auction.countDocuments({ status: 'active' }),
      Auction.countDocuments({ status: 'ended' }),
      User.countDocuments(),
      Auction.find({ status: 'active' })
    ]);

    const totalBidsPlaced = allAuctions.reduce((sum, a) => sum + a.bidCount, 0);
    const totalRevenue = (await Auction.find({ status: 'ended' }))
      .reduce((sum, a) => sum + a.currentPrice, 0);

    res.json({
      totalAuctions,
      activeAuctions,
      endedAuctions,
      totalUsers,
      totalBidsPlaced,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/auctions — all auctions with full details
router.get('/auctions', async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// POST /api/admin/auctions — create auction
router.post('/auctions', async (req, res) => {
  try {
    const {
      title, description, highlights, category, emoji, imageUrl,
      startingPrice, minBidIncrement, endsAt, isFeatured
    } = req.body;

    if (!title || !category || !startingPrice || !endsAt)
      return res.status(400).json({ error: 'title, category, startingPrice, endsAt required' });

    const auction = await Auction.create({
      title, description, highlights: highlights || [],
      category, emoji: emoji || '🏺', imageUrl: imageUrl || '',
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      minBidIncrement: Number(minBidIncrement) || 100,
      endsAt: new Date(endsAt),
      isFeatured: !!isFeatured,
      status: 'active'
    });

    const io = req.app.get('io');
    io.emit('auction:new', auction);

    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create auction', details: err.message });
  }
});

// PUT /api/admin/auctions/:id — update auction
router.put('/auctions/:id', async (req, res) => {
  try {
    const allowed = ['title', 'description', 'highlights', 'category', 'emoji',
      'imageUrl', 'isFeatured', 'endsAt', 'status', 'minBidIncrement'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const auction = await Auction.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const io = req.app.get('io');
    io.emit('auction:updated', auction);

    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update auction' });
  }
});

// DELETE /api/admin/auctions/:id
router.delete('/auctions/:id', async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const io = req.app.get('io');
    io.emit('auction:deleted', { auctionId: req.params.id });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete auction' });
  }
});

// POST /api/admin/auctions/:id/cancel
router.post('/auctions/:id/cancel', async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const io = req.app.get('io');
    io.emit('auction:cancelled', { auctionId: auction._id, title: auction.title });

    res.json(auction);
  } catch {
    res.status(500).json({ error: 'Failed to cancel auction' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT /api/admin/users/:id/toggle-admin
router.put('/users/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
