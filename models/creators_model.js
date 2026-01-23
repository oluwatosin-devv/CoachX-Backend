const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Creator profile must belong to a user'],
      unique: true,
    },
    displayName: {
      type: String,
      required: [true, 'A public display name is required'],
      minlength: 3,
      maxlength: 50,
    },
    specialization: {
      type: [String],
      required: [true, 'At least one specialization is required'],
      set: (arr) => arr.map((s) => String(s).toLowerCase().trim()),
      enum: [
        'fitness',
        'nutrition',
        'mindfulness',
        'coaching',
        'sports',
        'wellness',
      ],
    },
    subscriptionPrice: {
      type: Number,
      required: [true, 'Subscription price is required'],
      min: [0.01, 'Subscription price must be greater than 0'],
    },
    subscriptionCurrency: {
      type: String,
      required: [true, 'Subscription currency is required'],
      default: 'NGN',
    },
    subscriptionInterval: {
      type: String,
      enum: ['monthly'], // MVP only supports monthly
      required: true,
      default: 'monthly',
    },
    bio: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: 'default.jpg',
    },
    bannerImage: {
      type: String,
    },
    socials: {
      instagram: String,
      youtube: String,
      tiktok: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

creatorProfileSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'fullName profilePhoto',
  });
  next();
});

const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);

module.exports = CreatorProfile;
