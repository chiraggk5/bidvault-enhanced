require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const adminRoutes = require('./routes/admin');
const Auction = require('./models/Auction');
const User = require('./models/User');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const ADMIN_EMAIL = 'admin@bidvault.com';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);

// ─── MIDDLEWARE ───
app.use(cors());
app.use(express.json());

// ─── API ROUTES ───
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/admin', adminRoutes);

// ─── SERVE REACT BUILD ───
const clientBuild = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

// ─── SOCKET.IO ───
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── AUCTION EXPIRY CHECKER (runs every 30s) ───
setInterval(async () => {
  try {
    const expired = await Auction.find({
      status: 'active',
      endsAt: { $lte: new Date() }
    });

    for (const auction of expired) {
      auction.status = 'ended';
      auction.winner = auction.leadingBidder || null;
      auction.winnerId = auction.leadingBidderId || null;
      await auction.save();

      // Update winner stats
      if (auction.winnerId) {
        await User.findByIdAndUpdate(auction.winnerId, {
          $inc: { wonAuctions: 1, totalSpent: auction.currentPrice }
        });
      }

      io.emit('auction:ended', {
        auctionId: auction._id,
        title: auction.title,
        emoji: auction.emoji,
        winner: auction.winner,
        finalPrice: auction.currentPrice
      });

      console.log(`🏁 Auction ended: ${auction.title} — Winner: ${auction.winner}`);
    }
  } catch (err) {
    console.error('Expiry check error:', err.message);
  }
}, 30 * 1000);

// ─── SEED ADMIN USER IF NONE EXISTS ───
async function seedAdmin() {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    admin.username = ADMIN_USERNAME;
    admin.isAdmin = true;
    await admin.save();
  } else {
    admin = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      username: ADMIN_USERNAME,
      isAdmin: true
    });
  }

  console.log(`✅ Default admin ready: ${admin.email} / ${ADMIN_PASSWORD}`);
}

// ─── CONNECT & LISTEN ───
const PORT = process.env.PORT || 5000;

if (!mongoUri) {
  console.error('❌ Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedAdmin();
    server.listen(PORT, () => {
      console.log(`🚀 BidVault server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
