const CreatorProfile = require('../models/creators_model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.createProfile = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;

    const existingProfile = await CreatorProfile.findOne({ user: userId });
    if (existingProfile) {
      return next(new AppError('You already have a creator profile', 400));
    }

    const {
      displayName,
      specialization,
      subscriptionPrice,
      subscriptionCurrency,
      subscriptionInterval,
      bio,
      profilePhoto,
      bannerImage,
      socialLinks,
    } = req.body;

    const creatorProfile = await CreatorProfile.create({
      user: userId,
      displayName,
      specialization,
      subscriptionPrice,
      subscriptionCurrency,
      subscriptionInterval,
      bio,
      profilePhoto,
      bannerImage,
      socialLinks,
      isActive: true,
      isVerified: false,
    });

    if (req.user.role !== 'creator') {
      await User.findByIdAndUpdate(userId, { role: 'creator' });
    }

    res.status(201).json({
      status: 'success',
      data: {
        creatorProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.updateProfile = catchAsync(async (req, res, next) => {});
exports.getProfile = catchAsync(async (req, res, next) => {});
exports.deleteProfile = catchAsync(async (req, res, next) => {});
exports.verifyProfile = catchAsync(async (req, res, next) => {});
