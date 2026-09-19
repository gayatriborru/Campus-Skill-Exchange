const express = require('express');
const router = express.Router();
const { getMyAnalytics, getPlatformStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/platform-stats', getPlatformStats);
router.get('/me', protect, getMyAnalytics);

module.exports = router;
