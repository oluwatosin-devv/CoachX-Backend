const express = require('express');
const {
  signup,
  login,
  forgotpassword,
  resetPassword,
  verifyEmail,
  protect,
  verified,
  verifyOTP,
} = require('../controllers/authController');
const { updateMe, getUser } = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotpassword').post(forgotpassword);
router.route('/resetpassword/:token').patch(resetPassword);
router.route('/verifyemail/:token').patch(verifyEmail);
router.route('/VerifyOtp').post(protect, verifyOTP);

router.use(protect);
router.route('/updateme').patch(verified, updateMe);
router.route('/me').get(verified, getUser);

module.exports = router;
