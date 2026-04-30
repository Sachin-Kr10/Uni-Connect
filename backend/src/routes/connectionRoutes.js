const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.post('/request', connectionController.sendRequest);
router.put('/:connectionId/accept', connectionController.acceptRequest);
router.put('/:connectionId/decline', connectionController.declineRequest);
router.get('/', connectionController.getConnections);
router.get('/pending', connectionController.getPendingRequests);
router.get('/status/:userId', connectionController.getConnectionStatus);
router.delete('/:connectionId', connectionController.removeConnection);

module.exports = router;
