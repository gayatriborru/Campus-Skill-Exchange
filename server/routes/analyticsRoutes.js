const express = require('express');
const router = express.Router();
const { getMyAnalytics, getPlatformStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Protect all analytics endpoints: platform stats and personal analytics require login
router.use(protect);

router.get('/platform-stats', getPlatformStats);
router.get('/me', getMyAnalytics);

module.exports = router;
