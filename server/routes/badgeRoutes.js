const express = require('express');
const router = express.Router();
const { getAllBadges } = require('../controllers/badgeController');

router.get('/', getAllBadges);

module.exports = router;
