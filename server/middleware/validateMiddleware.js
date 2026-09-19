const { body, validationResult } = require('express-validator');

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('College Email is required')
    .isEmail()
    .withMessage('Please provide a valid college email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('year')
    .trim()
    .notEmpty()
    .withMessage('College Year is required'),
  checkValidation,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  checkValidation,
];

const validateSession = [
  body('teacher').notEmpty().withMessage('Teacher ID is required'),
  body('skill').notEmpty().withMessage('Skill ID is required'),
  body('date').notEmpty().withMessage('Session date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  checkValidation,
];

const validateRating = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('skillKnowledge')
    .isInt({ min: 1, max: 5 })
    .withMessage('Skill Knowledge rating must be between 1 and 5'),
  body('communication')
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('helpfulness')
    .isInt({ min: 1, max: 5 })
    .withMessage('Helpfulness rating must be between 1 and 5'),
  checkValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateSession,
  validateRating,
};
