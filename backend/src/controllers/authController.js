const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, isUniversityEmail } = require('../utils/helpers');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate Email Domain
    if (!isUniversityEmail(email)) {
      return res.status(400).json({ message: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} emails are allowed.` });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Generate Tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // 6. Save Refresh Token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // 7. Send Refresh Token in HTTP-only Cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true, // completely hides cookie from JS
      secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
      sameSite: 'strict', // prevents CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // 8. Send Access Token and basic User info in JSON response
    res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate Tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // 4. Save Refresh Token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Send Refresh Token in HTTP-only Cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    // 6. Send Response
    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Refresh Access Token
const refreshTokens = async (req, res) => {
  try {
    const cookies = req.cookies;

    // 1. Check if jwt cookie exists
    if (!cookies?.jwt) {
      return res.status(401).json({ message: 'Unauthorized, no refresh token' });
    }

    const refreshToken = cookies.jwt;

    // 2. Find user by refresh token in DB (Logout from all devices protection)
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      // Token is valid but user not found or logged out
      return res.status(403).json({ message: 'Forbidden, invalid refresh token' });
    }

    // 3. Verify Refresh Token
    jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err || user.id !== decoded.id) {
          return res.status(403).json({ message: 'Forbidden, token expired or mismatched' });
        }

        // 4. Issue new Access Token
        const accessToken = generateAccessToken(user.id, user.role);
        res.json({ accessToken });
      }
    );

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    const refreshToken = cookies.jwt;

    // 1. Remove refresh token from DB
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // 2. Clear cookie
    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.sendStatus(204);

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout
};
