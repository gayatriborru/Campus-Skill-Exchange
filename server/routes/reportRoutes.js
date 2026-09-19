const express = require('express');
const router = express.Router();
const { createReport, toggleBlockUser } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createReport);
router.post('/block', toggleBlockUser);

module.exports = router;
