const express = require('express');
const {
  signup,
  login,
  forgotpassword,
  resetPassword,
  verifyEmail,
  protect,
} = require('../controllers/authController');
const { updateMe, getUser } = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotpassword').post(forgotpassword);
router.route('/resetpassword/:token').patch(resetPassword);
router.route('/verifyemail/:token').patch(verifyEmail);

router.use(protect);
router.route('/updateme').patch(updateMe);
router.route('/me').get(getUser);

module.exports = router;
