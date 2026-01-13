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

exports.getProfile = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    let profile;
    if (id) {
      profile = await CreatorProfile.findById(id);
    } else if (userId) {
      profile = await CreatorProfile.findOne({ user: userId });
    } else if (req.user) {
      profile = await CreatorProfile.findOne({ user: req.user.id });
    } else {
      return next(
        new AppError('No identifier provided to fetch creator profile', 400)
      );
    }

    if (!profile) return next(new AppError('Creator profile not found', 404));

    const requester = req.user;
    const isOwner =
      requester &&
      profile.user &&
      requester.id === String(profile.user._id || profile.user);
    const isAdmin = requester && requester.role === 'admin';

    if (isOwner || isAdmin) {
      return res
        .status(200)
        .json({ status: 'success', data: { creatorProfile: profile } });
    }

    const publicFields = (({
      _id,
      displayName,
      specialization,
      subscriptionPrice,
      subscriptionCurrency,
      subscriptionInterval,
      bio,
      profilePhoto,
      bannerImage,
      createdAt,
      user,
    }) => ({
      _id,
      displayName,
      specialization,
      subscriptionPrice,
      subscriptionCurrency,
      subscriptionInterval,
      bio,
      profilePhoto,
      bannerImage,
      createdAt,
      user,
    }))(profile.toObject ? profile.toObject() : profile);

    res
      .status(200)
      .json({ status: 'success', data: { creatorProfile: publicFields } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.getProfiles = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.specialization) {
    const specs = String(req.query.specialization)
      .split(',')
      .map((s) => s.trim());
    filter.specialization = { $in: specs };
  }

  if (req.query.isVerified !== undefined) {
    const v = String(req.query.isVerified).toLowerCase();
    if (v === 'true' || v === 'false') filter.isVerified = v === 'true';
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.subscriptionPrice = {};
    if (req.query.minPrice)
      filter.subscriptionPrice.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice)
      filter.subscriptionPrice.$lte = Number(req.query.maxPrice);
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
  const skip = (page - 1) * limit;

  // Sorting
  let sort = '-createdAt';
  if (req.query.sort) {
    const allowed = ['createdAt', 'subscriptionPrice'];
    const field = req.query.sort.replace('-', '');
    if (allowed.includes(field)) sort = req.query.sort;
  }

  // Query
  const query = CreatorProfile.find(filter).sort(sort).skip(skip).limit(limit);

  // Decide which fields to return: admins see everything, others get public fields
  const requester = req.user;
  const isAdmin = requester && requester.role === 'admin';
  if (!isAdmin) {
    query.select(
      'displayName specialization subscriptionPrice subscriptionCurrency subscriptionInterval bio profilePhoto bannerImage createdAt user'
    );
  }

  const docs = await query.exec();

  // Count for pagination
  const total = await CreatorProfile.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: docs.length,
    page,
    total,
    data: {
      creatorProfiles: docs,
    },
  });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {});
exports.verifyProfile = catchAsync(async (req, res, next) => {});
