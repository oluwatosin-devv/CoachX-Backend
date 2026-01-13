const express = require('express');
const {
  createProfile,
  deleteProfile,
  updateProfile,
  getProfile,
  verifyProfile,
  getProfiles,
} = require('../controllers/creatorController');
const {
  protect,
  restrictTo,
  verified,
} = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(protect, verified, createProfile)
  .get(protect, verified, getProfiles);

router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfile);
router.delete('/me', protect, deleteProfile);

router.get('/:id', protect, verified, getProfile);

// THis fort he admin
router.patch('/:creatorId/verify', protect, restrictTo('admin'), verifyProfile);

module.exports = router;
