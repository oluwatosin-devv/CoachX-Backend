const express = require('express');
const { createProfile, deleteProfile, updateProfile, getProfile, verifyProfile } = require('../controllers/creatorController');
const { protect, restrictTo, verified } = require('../controllers/authController');

const router = express.Router();

router.route('/').post(protect, verified, createProfile);
router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfile);
router.delete('/me', protect, deleteProfile);


// THis fort he admin
router.patch(
  '/:creatorId/verify',
  protect,
  restrictTo('admin'),
  verifyProfile
);


module.exports = router;
