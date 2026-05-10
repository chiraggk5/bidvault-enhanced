const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  placedAt: { type: Date, default: Date.now }
});

const auctionSchema = new mongoose.Schema({
  emoji: { type: String, default: '🏺' },
  imageUrl: { type: String, default: '' },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  highlights: [{ type: String }],
  startingPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  minBidIncrement: { type: Number, default: 100 },
  leadingBidder: { type: String, default: null },
  leadingBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bids: [bidSchema],
  bidCount: { type: Number, default: 0 },
  endsAt: { type: Date, required: true },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'ended', 'cancelled'], default: 'active' },
  winner: { type: String, default: null },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

auctionSchema.virtual('timeLeft').get(function () {
  return Math.max(0, this.endsAt - Date.now());
});

auctionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Auction', auctionSchema);
