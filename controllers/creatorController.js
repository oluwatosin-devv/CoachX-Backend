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

exports.updateProfile = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return next(new AppError('Authentication required', 401));

    const profile = await CreatorProfile.findOne({ user: userId });
    if (!profile) return next(new AppError('Creator profile not found', 404));

    if (String(profile.user._id || profile.user) !== String(userId))
      return next(
        new AppError('You are not allowed to edit this profile', 403)
      );

    const allowed = [
      'displayName',
      'bio',
      'profilePhoto',
      'bannerImage',
      'socialLinks',
      'socials',
      'specialization',
      'subscriptionPrice',
      'subscriptionCurrency',
      'subscriptionInterval',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.displayName) {
      if (
        typeof updates.displayName !== 'string' ||
        updates.displayName.length < 3 ||
        updates.displayName.length > 50
      )
        return next(new AppError('`displayName` must be 3-50 characters', 400));
    }

    if (updates.bio) {
      if (typeof updates.bio !== 'string' || updates.bio.length > 150)
        return next(new AppError('`bio` max length is 150', 400));
    }

    if (updates.specialization) {
      if (!Array.isArray(updates.specialization)) {
        if (typeof updates.specialization === 'string')
          updates.specialization = updates.specialization
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        else
          return next(
            new AppError(
              '`specialization` must be an array or comma-separated string',
              400
            )
          );
      }
      if (updates.specialization.length === 0)
        return next(
          new AppError('At least one specialization is required', 400)
        );
    }

    if (updates.subscriptionPrice !== undefined) {
      const price = Number(updates.subscriptionPrice);
      if (Number.isNaN(price) || price <= 0)
        return next(
          new AppError(
            '`subscriptionPrice` must be a number greater than 0',
            400
          )
        );
      updates.subscriptionPrice = price;
    }

    delete updates.user;
    delete updates._id;
    delete updates.isVerified;

    if (updates.socialLinks && !updates.socials) {
      updates.socials = updates.socialLinks;
      delete updates.socialLinks;
    }

    Object.assign(profile, updates);
    const updated = await profile.save();

    res
      .status(200)
      .json({ status: 'success', data: { creatorProfile: updated } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

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
      return next(new AppError('No identifier provided', 400));
    }

    if (!profile) {
      return next(new AppError('Creator profile not found', 404));
    }

    const requester = req.user;
    const isOwner =
      requester &&
      profile.user &&
      String(profile.user) === String(requester.id);
    const isAdmin = requester && requester.role === 'admin';

    if (isOwner || isAdmin) {
      return res.status(200).json({
        status: 'success',
        data: { creatorProfile: profile },
      });
    }

    const publicProfile = {
      _id: profile._id,
      displayName: profile.displayName,
      specialization: profile.specialization,
      subscriptionPrice: profile.subscriptionPrice,
      subscriptionCurrency: profile.subscriptionCurrency,
      subscriptionInterval: profile.subscriptionInterval,
      bio: profile.bio,
      profilePhoto: profile.profilePhoto,
      bannerImage: profile.bannerImage,
      createdAt: profile.createdAt,
      user: profile.user,
    };

    res.status(200).json({
      status: 'success',
      data: { creatorProfile: publicProfile },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.getProfiles = catchAsync(async (req, res, next) => {
  try {
    const filter = {
      user: { $ne: null },
    };

    const requester = req.user;
    const isAdmin = requester && requester.role === 'admin';

    if (!isAdmin) {
      filter.isActive = true;
    }

    if (req.query.specialization) {
      const specs = String(req.query.specialization)
        .split(',')
        .map((s) => s.trim());
      filter.specialization = { $in: specs };
    }

    if (req.query.isVerified !== undefined) {
      const v = String(req.query.isVerified).toLowerCase();
      if (v === 'true' || v === 'false') {
        filter.isVerified = v === 'true';
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.subscriptionPrice = {};
      if (req.query.minPrice)
        filter.subscriptionPrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        filter.subscriptionPrice.$lte = Number(req.query.maxPrice);
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || '10', 10))
    );
    const skip = (page - 1) * limit;

    let sort = '-createdAt';
    if (req.query.sort) {
      const allowed = ['createdAt', 'subscriptionPrice'];
      const field = req.query.sort.replace('-', '');
      if (allowed.includes(field)) sort = req.query.sort;
    }

    const query = CreatorProfile.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (!isAdmin) {
      query.select(
        'displayName specialization subscriptionPrice subscriptionCurrency subscriptionInterval bio profilePhoto bannerImage createdAt user'
      );
    }

    const docs = await query.exec();
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  const { creatorId } = req.params;
  const requester = req.user;

  if (requester.role !== 'admin') {
    return next(new AppError('Only admin can permanently delete profiles', 403));
  }

  const profile = await CreatorProfile.findById(creatorId);
  if (!profile) {
    return next(new AppError('Creator profile not found', 404));
  }

  await CreatorProfile.findByIdAndDelete(creatorId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deactivateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { creatorId } = req.params;
  const requester = req.user;

  const profile = await CreatorProfile.findById(creatorId);
  if (!profile) {
    return next(new AppError('Creator profile not found', 404));
  }

  const isOwner = String(profile.user) === String(userId);
  const isAdmin = requester.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(
      new AppError('You are not allowed to deactivate this profile', 403)
    );
  }

  profile.isActive = false;
  profile.deactivatedAt = new Date();
  await profile.save();

  res.status(200).json({
    status: 'success',
    data: {
      creatorProfile: profile,
    },
  });
});

exports.reactivateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { creatorId } = req.params;
  const requester = req.user;

  const profile = await CreatorProfile.findById(creatorId);
  if (!profile) {
    return next(new AppError('Creator profile not found', 404));
  }

  const isOwner = String(profile.user) === String(userId);
  const isAdmin = requester.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(
      new AppError('You are not allowed to reactivate this profile', 403)
    );
  }

  profile.isActive = true;
  profile.deactivatedAt = null;
  await profile.save();

  res.status(200).json({
    status: 'success',
    data: {
      creatorProfile: profile,
    },
  });
});

exports.verifyProfile = catchAsync(async (req, res, next) => {
  const { creatorId } = req.params;
  const requester = req.user;

  if (requester.role !== 'admin') {
    return next(new AppError('Only admin can verify profiles', 403));
  }

  const profile = await CreatorProfile.findById(creatorId);
  if (!profile) {
    return next(new AppError('Creator profile not found', 404));
  }

  profile.isVerified = true;
  profile.verifiedAt = new Date();
  await profile.save();

  res.status(200).json({
    status: 'success',
    data: {
      creatorProfile: profile,
    },
  });
});
