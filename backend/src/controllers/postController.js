const { Post, User, Comment, Like, Group } = require('../models');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, mediaUrl, groupId } = req.body;
    const userId = req.user.id; // From authMiddleware

    const post = await Post.create({
      content,
      mediaUrl,
      userId,
      groupId: groupId || null
    });

    // Fetch with User info to return to frontend
    const postWithUser = await Post.findByPk(post.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Feed (cursor or page based pagination)
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Post.findAndCountAll({
      where: { groupId: null }, // Only public feed posts
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Like, attributes: ['userId'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true // Required when including related models in findAndCountAll
    });

    // Format if current user liked it
    const reqUserId = req.user.id;
    const posts = rows.map(post => {
      const p = post.toJSON();
      p.isLikedByMe = p.Likes.some(like => like.userId === reqUserId);
      return p;
    });

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle Like
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likesCount');
      res.json({ message: 'Unliked', liked: false });
    } else {
      // Like
      await Like.create({ postId, userId });
      await post.increment('likesCount');
      res.json({ message: 'Liked', liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({ postId, userId, content });
    await post.increment('commentsCount');

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    // Emitting via Socket.IO for real-time comment update
    req.io.emit(`post:${postId}:new_comment`, commentWithUser);

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Comments for Post
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.findAll({
      where: { postId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  getComments
};
