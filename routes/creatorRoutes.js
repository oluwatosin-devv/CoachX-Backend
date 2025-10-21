const express = require('express');
const { getAllCreator } = require('../controllers/creatorController');

const router = express.Router();

router.route('/').get(getAllCreator);

module.exports = router;
