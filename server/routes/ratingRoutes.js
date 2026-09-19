const express = require('express');
const router = express.Router();
const { createRating, getStudentRatings } = require('../controllers/ratingController');
const { validateRating } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, validateRating, createRating);
router.get('/:studentId', getStudentRatings);

module.exports = router;
