const express = require('express');
const router = express.Router();
const { getMatches, getMatchWithStudent } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMatches);
router.get('/:studentId', getMatchWithStudent);

module.exports = router;
