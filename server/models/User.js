const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  username: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
  isAdmin: { type: Boolean, default: false },
  totalBids: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  wonAuctions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; return ret; }
});

module.exports = mongoose.model('User', userSchema);
