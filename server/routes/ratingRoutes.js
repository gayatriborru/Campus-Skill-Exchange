const express = require('express');
const router = express.Router();
const { createRating, getStudentRatings } = require('../controllers/ratingController');
const { validateRating } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Protect all rating routes: reviews and ratings require authentication
router.use(protect);

router.post('/', validateRating, createRating);
router.get('/:studentId', getStudentRatings);

module.exports = router;
