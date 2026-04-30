const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
