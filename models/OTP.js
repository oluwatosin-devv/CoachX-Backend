const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const OTPSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'OTP must belong to a user'],
  },
  otp: {
    type: String,
    required: [true, 'OTP cannot be empty'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 10 * 60 * 1000,
  },
});

OTPSchema.methods.compareOTP = async function (otp, hashedOTP) {
  return await bcrypt.compare(otp, hashedOTP);
};

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;
