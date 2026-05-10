const express = require('express');
const Auction = require('../models/Auction');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/auctions — list active auctions
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const auctions = await Auction.find(filter).sort({ isFeatured: -1, endsAt: 1 });
    res.json(auctions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// GET /api/auctions/all — all auctions (active, ended, cancelled)
router.get('/all', async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// GET /api/auctions/stats/leaderboard
router.get('/stats/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'username totalBids totalSpent wonAuctions')
      .sort({ wonAuctions: -1, totalSpent: -1 })
      .limit(10);
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/auctions/my/bids — bids made by current user
router.get('/my/bids', auth, async (req, res) => {
  try {
    const auctions = await Auction.find({ 'bids.user': req.user._id }).sort({ createdAt: -1 });
    const result = auctions.map(a => {
      const myBids = a.bids.filter(b => b.user.toString() === req.user._id.toString());
      const myMax = Math.max(...myBids.map(b => b.amount));
      return {
        _id: a._id,
        title: a.title,
        emoji: a.emoji,
        category: a.category,
        currentPrice: a.currentPrice,
        myHighestBid: myMax,
        bidCount: myBids.length,
        status: a.status,
        endsAt: a.endsAt,
        isWinner: a.winner === req.user.username,
        isLeading: a.leadingBidder === req.user.username
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your bids', details: err.message });
  }
});

// GET /api/auctions/:id
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(auction);
  } catch {
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// POST /api/auctions/:id/bid
router.post('/:id/bid', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ error: 'Auction has ended' });
    if (new Date() > auction.endsAt) return res.status(400).json({ error: 'Auction has ended' });
    if (typeof amount !== 'number' || amount <= auction.currentPrice) {
      return res.status(400).json({
        error: `Bid must be higher than current price of ₹${auction.currentPrice.toLocaleString('en-IN')}`
      });
    }

    auction.bids.push({ user: req.user._id, username: req.user.username, amount });
    auction.currentPrice = amount;
    auction.leadingBidder = req.user.username;
    auction.leadingBidderId = req.user._id;
    auction.bidCount = auction.bids.length;
    await auction.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalBids: 1 }
    });

    const io = req.app.get('io');
    io.emit('bid:new', {
      auctionId: auction._id,
      amount,
      username: req.user.username,
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      title: auction.title,
      emoji: auction.emoji
    });

    res.json({ success: true, auction });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place bid', details: err.message });
  }
});

module.exports = router;
