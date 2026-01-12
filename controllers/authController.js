const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const crypto = require('crypto');
const { use } = require('../app');
const Email = require('../utils/email');
const OTP = require('../models/OTP');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: 'user',
  });

  await newUser.save({ validateBeforeSave: false });

  const token = signToken(newUser.id);

  try {
    await new Email(newUser).sendOtpmail();
  } catch (err) {
    console.error('OTP email failed:', err);
  }

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Provide email and password', 400));
  }

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (!user.isActive) {
    return next(new AppError('Account inactive, contact support', 401));
  }

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.forgotpassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Please provide an email', 400));

  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('The user with this email does not exist', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const url = `https://coach-x.vercel.app/reset-password/${resetToken}`;

  await new Email(user, url).sendPasswordResetEmail();

  res.status(200).json({
    status: 'success',
    message: 'Token sent to mail',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user)
    return next(new AppError('Token is invalid or has expired !!', 401));


  if (await user.correctPassword(password, user.password))
    return next(
      new AppError('New password cannot be the same as old password', 400)
    );
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password Changed Successfully',
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiresIn: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError('Token is invalid or has expired !!', 401));

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiresIn = undefined;
  await user.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    status: 'success',
    message: 'email verified successfully',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET
  );

  if (!token)
    return next(
      new AppError('You are not logged in!, please login to get Access', 401)
    );

  const freshuser = await User.findById(decoded.id);
  if (!freshuser)
    return next(new AppError('The User with this ID does not exist', 401));

  if (freshuser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  req.user = freshuser;
  next();
});

exports.verified = (req, res, next) => {
  if (req.user.isVerified === false)
    return next(new AppError('You must be verified to access this route', 401));

  next();
};

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { action } = req.query;
  const user = req.body.user || req.user.id;
  const { otp } = req.body;
  console.log(user, otp);

  if (!user || !otp)
    return next(new AppError('Empty otp details not allowed', 400));

  const userotprecords = await OTP.findOne({
    user,
    expiresAt: { $gt: Date.now() },
  });

  if (!userotprecords)
    return next(new AppError('Code expired, please request again'));

  if (!(await userotprecords.compareOTP(`${otp}`, userotprecords.otp)))
    return next(new AppError('Invalid OTP'));

  await OTP.deleteMany({ user });

  await User.findByIdAndUpdate(user, { isVerified: true });

  res.status(200).json({
    status: 'success',
    message: 'User email verified successfully',
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };
};
