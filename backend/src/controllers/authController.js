const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, OTP } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken, isUniversityEmail } = require('../utils/helpers');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, otpCode } = req.body;

    // 1. Validate Email Domain
    if (!isUniversityEmail(email)) {
      return res.status(400).json({ message: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} emails are allowed.` });
    }

    // 2. Validate OTP
    if (!otpCode) {
      return res.status(400).json({ message: 'OTP is required for registration' });
    }

    const otpRecord = await OTP.findOne({ 
      where: { email, code: otpCode },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await otpRecord.destroy();
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ['user', 'club', 'admin'].includes(role) ? role : 'user', // Ensure valid role
    });

    // Cleanup OTP
    await OTP.destroy({ where: { email } });

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

// Send OTP via Email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isUniversityEmail(email)) {
      return res.status(400).json({ message: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} emails are allowed.` });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save to DB
    await OTP.create({ email, code: otpCode, expiresAt });

    // Send via Nodemailer
    try {
      await sendEmail({
        to: email,
        subject: 'Your Uni-Connect Verification Code',
        text: `Welcome to Uni-Connect! Your verification code is ${otpCode}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Welcome to Uni-Connect!</h2>
            <p>Your email verification code is:</p>
            <h1 style="letter-spacing: 5px; font-size: 36px; color: #334155;">${otpCode}</h1>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
          </div>
        `
      });
      res.json({ message: 'OTP sent to your email successfully.' });
    } catch (mailError) {
      console.error('Nodemailer error -> falling back to console log:', mailError);
      // Fallback for dev if env vars aren't set
      console.log(`\n\n[MOCK EMAIL] To: ${email} | Subject: Your Verification Code | OTP: ${otpCode}\n\n`);
      res.json({ message: 'OTP generated (Check server console if Mailtrap is not configured).' });
    }
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP generation' });
  }
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  sendOTP
};
