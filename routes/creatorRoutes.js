const express = require('express');
const { createProfile } = require('../controllers/creatorController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.route('/').post(protect, createProfile);

module.exports = router;
