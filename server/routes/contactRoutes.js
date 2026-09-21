const express = require('express');
const router = express.Router();
const { submitContactMessage } = require('../controllers/contactController');

// Public route: Submit contact form message
router.post('/', submitContactMessage);

module.exports = router;
