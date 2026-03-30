const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/:groupId', groupController.getGroupDetails);
router.post('/:groupId/join', groupController.joinGroup); 

module.exports = router;
