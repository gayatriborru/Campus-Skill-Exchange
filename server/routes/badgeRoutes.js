const express = require('express');
const router = express.Router();
const { getAllBadges } = require('../controllers/badgeController');
const { protect } = require('../middleware/authMiddleware');

// Protect badges route: gamification badges require authentication
router.use(protect);

router.get('/', getAllBadges);

module.exports = router;
