const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  updateSession,
} = require('../controllers/sessionController');
const { validateSession } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', validateSession, createSession);
router.get('/', getSessions);
router.put('/:id', updateSession);

module.exports = router;
