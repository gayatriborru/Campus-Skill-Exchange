const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'student') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'campus_skill_exchange_super_secret_jwt_key_2026_x89a1b2c3d',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
