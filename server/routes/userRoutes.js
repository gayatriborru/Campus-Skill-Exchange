const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const {
  getMySkills,
  addStudentSkill,
  deleteStudentSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

// Student skills endpoints
router.get('/skills', protect, getMySkills);
router.post('/skills', protect, addStudentSkill);
router.delete('/skills/:id', protect, deleteStudentSkill);

// Discover users
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
