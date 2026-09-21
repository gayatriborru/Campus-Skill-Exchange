const express = require('express');
const router = express.Router();
const { getSkills, addSkill, getCategories } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

// Protect all skill routes: unauthenticated users cannot access campus taxonomy
router.use(protect);

router.get('/categories', getCategories);
router.get('/', getSkills);
router.post('/', addSkill);

module.exports = router;
