const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' } // 15 minutes is standard for access tokens
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 days is standard for refresh tokens
  );
};

// Validates that email ends with the allowed domain
const isUniversityEmail = (email) => {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@gmail.com';
  return email.endsWith(allowedDomain);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isUniversityEmail,
};
