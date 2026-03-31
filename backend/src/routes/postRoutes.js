const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.use(verifyAccessToken);

router.post('/', postController.createPost);
router.get('/feed', postController.getFeed);
router.post('/:postId/like', postController.toggleLike);
router.post('/:postId/comment', postController.addComment);
router.get('/:postId/comments', postController.getComments);
router.get('/user/:userId', postController.getUserPosts);

module.exports = router;
