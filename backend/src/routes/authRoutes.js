const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh', authController.refreshTokens);
router.post('/logout', authController.logout);
router.post('/send-otp', authController.sendOTP);

module.exports = router;
