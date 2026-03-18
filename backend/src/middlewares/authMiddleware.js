const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  // 1. Get auth header (Bearer Token)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized, no token provided' });
  }

  // 2. Extract Token
  const token = authHeader.split(' ')[1];

  // 3. Verify Token
  jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET,
    (err, decoded) => {
      if (err) {
         // Token might be expired, frontend should try to refresh it
        return res.status(403).json({ message: 'Forbidden, invalid or expired token' });
      }

      // Attach user info to request object to be used in next middleware/controllers
      req.user = decoded; 
      next();
    }
  );
};

module.exports = {
  verifyAccessToken
};
