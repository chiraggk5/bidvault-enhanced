require('dotenv').config();
const mongoose = require('mongoose');
const Auction = require('./models/Auction');
const User = require('./models/User');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const ADMIN_EMAIL = 'admin@bidvault.com';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const SAMPLE_AUCTIONS = [
  {
    title: 'Apple MacBook Pro M3 Max 16"',
    description: 'Brand new, sealed MacBook Pro with M3 Max chip. Comes with 36GB RAM, 1TB SSD. Perfect for creative professionals and developers. Includes original charger and documentation.',
    highlights: ['M3 Max Chip', '36GB Unified Memory', '1TB SSD', 'Space Black Color', 'AppleCare eligible'],
    category: 'Electronics', emoji: '💻',
    startingPrice: 180000, currentPrice: 180000, minBidIncrement: 1000,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), isFeatured: true
  },
  {
    title: 'Rolex Submariner Date 2022',
    description: 'Authentic Rolex Submariner Date in Oystersteel and yellow gold. Reference 126613LB. Comes with box and papers. Serviced and certified.',
    highlights: ['Box & Papers included', 'Serviced 2024', 'Reference 126613LB', 'Water resistant to 300m'],
    category: 'Watches', emoji: '⌚',
    startingPrice: 1500000, currentPrice: 1500000, minBidIncrement: 10000,
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), isFeatured: true
  },
  {
    title: 'Original Oil Painting — Sunset Over Goa',
    description: 'Large-format original oil painting by renowned Mumbai artist Priya Nair. Measures 36x48 inches. Signed and authenticated. Comes with provenance certificate.',
    highlights: ['Original artwork', 'Signed by artist', 'Certificate of authenticity', '36x48 inches', 'Ready to hang'],
    category: 'Art', emoji: '🎨',
    startingPrice: 85000, currentPrice: 85000, minBidIncrement: 2000,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), isFeatured: true
  },
  {
    title: 'Royal Enfield Bullet 350 2023 — Limited Edition',
    description: 'Barely used Royal Enfield Bullet 350 in Signals Desert Sand. Only 3,200 km driven. Full service history. All accessories included.',
    highlights: ['3,200 km only', 'Full service history', 'Signals Edition', 'Accessories included', 'No accidents'],
    category: 'Vehicles', emoji: '🏍️',
    startingPrice: 175000, currentPrice: 175000, minBidIncrement: 2000,
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Sony PlayStation 5 Slim + 5 Games Bundle',
    description: 'PS5 Slim disc edition, barely used for 2 months. Includes 5 AAA games: God of War Ragnarok, Spider-Man 2, Hogwarts Legacy, FIFA 25, and Elden Ring.',
    highlights: ['PS5 Slim Disc Edition', '5 AAA Games included', '2 controllers', 'All cables included', 'Warranty valid'],
    category: 'Electronics', emoji: '🎮',
    startingPrice: 55000, currentPrice: 55000, minBidIncrement: 500,
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Natural Diamond Solitaire Ring 2.5ct',
    description: 'Stunning GIA-certified natural diamond solitaire in 18K white gold. 2.5 carat, VS1 clarity, E color. Perfect for engagement or investment.',
    highlights: ['GIA Certified', '2.5 Carat Natural Diamond', 'VS1 Clarity, E Color', '18K White Gold', 'Investment grade'],
    category: 'Jewellery', emoji: '💎',
    startingPrice: 650000, currentPrice: 650000, minBidIncrement: 5000,
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Rare Antique Brass Idol — 18th Century Chola',
    description: 'Authenticated 18th century Chola-period brass Nataraja idol. Height: 14 inches. Comes with archaeological survey documentation.',
    highlights: ['Authenticated antique', 'Archaeological documentation', 'Chola period', '14 inch height', 'Rare collectible'],
    category: 'Antiques', emoji: '🏺',
    startingPrice: 320000, currentPrice: 320000, minBidIncrement: 5000,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Hermes Birkin 30 — Togo Leather Rouge H',
    description: 'Authentic Hermès Birkin 30 in Rouge H Togo leather with gold hardware. Comes with full set: dust bag, box, clochette, keys, and lock.',
    highlights: ['100% Authentic', 'Full set included', 'Togo leather', 'Gold hardware', 'Excellent condition'],
    category: 'Fashion', emoji: '👜',
    startingPrice: 1200000, currentPrice: 1200000, minBidIncrement: 10000,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)
  }
];

async function seed() {
  if (!mongoUri) { console.error('Missing MONGODB_URI'); process.exit(1); }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  // Clear existing auctions
  await Auction.deleteMany({});
  console.log('🗑️  Cleared existing auctions');

  // Ensure the default admin account exists and has admin privileges.
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
  console.log(`✅ Admin user ready: ${admin.email} / ${ADMIN_PASSWORD}`);

  // Create auctions
  await Auction.insertMany(SAMPLE_AUCTIONS);
  console.log(`✅ Created ${SAMPLE_AUCTIONS.length} sample auctions`);

  await mongoose.disconnect();
  console.log('🚀 Seed complete! Start the server and visit http://localhost:5000');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
