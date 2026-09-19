const express = require('express');
const router = express.Router();
const { getSkills, addSkill, getCategories } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getSkills);
router.post('/', protect, addSkill);

module.exports = router;

