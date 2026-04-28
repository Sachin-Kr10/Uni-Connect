const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role, name, email, profileImage) => {
  return jwt.sign(
    { id: userId, role, name, email, profileImage: profileImage || null },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const isUniversityEmail = (email) => {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@gmail.com';
  return email.endsWith(allowedDomain);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isUniversityEmail,
};
