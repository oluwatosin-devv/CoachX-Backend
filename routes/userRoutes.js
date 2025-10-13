const express = require('express');
const {
  signup,
  login,
  forgotpassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotpassword').post(forgotpassword);
router.route('/resetpassword/:token').patch(resetPassword);

module.exports = router;
