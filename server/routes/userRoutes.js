const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const {
  getMySkills,
  addStudentSkill,
  deleteStudentSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

// Protect all user endpoints: unauthenticated users cannot access student profiles or directory
router.use(protect);

// Student skills endpoints
router.get('/skills', getMySkills);
router.post('/skills', addStudentSkill);
router.delete('/skills/:id', deleteStudentSkill);

// Discover users & mentors
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
