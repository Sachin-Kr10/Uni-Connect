const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.post('/', storyController.createStory);
router.get('/active', storyController.getActiveStories);

module.exports = router;
