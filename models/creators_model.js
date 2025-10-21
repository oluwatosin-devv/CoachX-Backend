const mongoose = require('mongoose');

const creator_profile = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'creator profile must belong to a user'],
  },
  category: String,
  subscriptionPrice: Number,
  totalSubscribers: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  socials: {
    instagram: String,
    youtube: String,
    tiktok: String,
  },
});

creator_profile.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'fullName profilePhoto',
  });
  next();
});

const CreatorProfile = mongoose.model('CreatorProfile', creator_profile);

module.exports = CreatorProfile;
