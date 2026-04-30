const { Post, User, Comment, Like, Group, Connection } = require('../models');
const { Op } = require('sequelize');

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
      include: [
        { model: User, attributes: ['id', 'name', 'profileImage'] },
        { model: Group, attributes: ['id', 'name', 'imageUrl'] }
      ]
    });

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Feed — club posts visible to all, user posts visible to connections only
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const reqUserId = req.user.id;

    // Get accepted connection user IDs
    const connections = await Connection.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ senderId: reqUserId }, { receiverId: reqUserId }]
      },
      attributes: ['senderId', 'receiverId']
    });

    const connectedUserIds = connections.map(c =>
      c.senderId === reqUserId ? c.receiverId : c.senderId
    );
    // Include self
    connectedUserIds.push(reqUserId);

    // Feed: club posts (groupId not null) from any user + personal posts from connections
    const { count, rows } = await Post.findAndCountAll({
      where: {
        [Op.or]: [
          { groupId: { [Op.ne]: null } }, // All club posts
          { groupId: null, userId: { [Op.in]: connectedUserIds } } // Connection posts + own posts
        ]
      },
      include: [
        { model: User, attributes: ['id', 'name', 'profileImage'] },
        { model: Like, attributes: ['userId'] },
        { model: Group, attributes: ['id', 'name', 'imageUrl'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    // Format if current user liked it
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
      include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }]
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
      include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all posts by a specific user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.findAll({
      where: { userId },
      include: [
        { model: User, attributes: ['id', 'name', 'profileImage'] },
        { model: Like, attributes: ['userId'] },
        { model: Group, attributes: ['id', 'name', 'imageUrl'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post (owner only)
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ message: 'You can only delete your own posts' });

    // Delete associated comments and likes first
    await Comment.destroy({ where: { postId } });
    await Like.destroy({ where: { postId } });
    await post.destroy();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  getComments,
  getUserPosts,
  deletePost
};
