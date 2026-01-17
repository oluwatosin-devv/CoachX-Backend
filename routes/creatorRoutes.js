const express = require('express');
const {
  createProfile,
  deleteProfile,
  updateProfile,
  getProfile,
  verifyProfile,
  getProfiles,
  deactivateProfile,
  reactivateProfile,
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

router.post('/:creatorId/deactivate', protect, deactivateProfile);
router.post('/:creatorId/reactivate', protect, reactivateProfile);
router.delete('/:creatorId', protect, restrictTo('admin'), deleteProfile);

router.get('/:id', protect, verified, getProfile);

router.patch('/:creatorId/verify', protect, restrictTo('admin'), verifyProfile);

module.exports = router;
