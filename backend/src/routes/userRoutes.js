const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

// Protect all user routes
router.use(verifyAccessToken);

router.get('/search', userController.searchUsers);
router.get('/suggestions', userController.getSuggestions);

module.exports = router;
