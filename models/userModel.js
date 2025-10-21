const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide an email'],
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password must be the same',
      },
    },
    role: {
      type: String,
      enum: ['creator', 'user', 'admin'],
      default: 'user',
    },
    profilePhoto: {
      type: String,
      default: 'default.jpg',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [150, 'User bio must have less or equal than 40 characters'],
      minlength: [10, 'User bio must have more or equal than 10 characters'],
    },
    gender: {
      type: String,
    },
    fitnessGoal: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpiresIn: Date,

    is_active: {
      type: Boolean,
      default: true,
      select: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('creator', {
  ref: 'CreatorProfile',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  userPassword,
  hashedPassword
) {
  return await bcrypt.compare(userPassword, hashedPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const changedtimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTtimestamp < changedtimestamp;
  }
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpiresIn = Date.now() + 30 * 24 * 60 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
