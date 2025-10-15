const express = require('express');
const { JoinWaitlist } = require('../controllers/waitlistController');

const router = express.Router();

router.route('/').post(JoinWaitlist);

module.exports = router;
