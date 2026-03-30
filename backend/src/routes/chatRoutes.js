const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.post('/direct', chatController.getOrCreateDirectConversation);
router.get('/', chatController.getUserConversations);
router.get('/:conversationId/messages', chatController.getMessages);
router.post('/:conversationId/messages', chatController.sendMessage);

module.exports = router;
