const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/:groupId', groupController.getGroupDetails);
router.put('/:groupId', groupController.updateGroup);
router.post('/:groupId/join', groupController.joinGroup);
router.get('/:groupId/chat', groupController.getGroupChat);
router.delete('/:groupId/members/:userId', groupController.removeMember);
router.delete('/:groupId/messages/:messageId', groupController.deleteGroupMessage);

module.exports = router;
