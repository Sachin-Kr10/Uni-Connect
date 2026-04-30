const { User, Post, Connection } = require('../models');
const { Op } = require('sequelize');

// Search users by name
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json([]);

    const users = await User.findAll({
      where: {
        name: {
          [Op.like]: `%${q}%`
        },
        id: {
          [Op.ne]: req.user.id
        }
      },
      attributes: ['id', 'name', 'role', 'profileImage', 'bio'],
      limit: 20
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
};

// Get suggested users (exclude already connected)
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get connected user IDs
    const connections = await Connection.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      attributes: ['senderId', 'receiverId']
    });

    const connectedIds = connections.map(c =>
      c.senderId === userId ? c.receiverId : c.senderId
    );
    connectedIds.push(userId); // Exclude self

    const suggestions = await User.findAll({
      where: {
        id: { [Op.notIn]: connectedIds }
      },
      attributes: ['id', 'name', 'role', 'profileImage'],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile by ID (with connection count)
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'profileImage', 'bio', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get post count
    const postCount = await Post.count({ where: { userId: id, groupId: null } });

    // Get connection count (accepted connections)
    const connectionCount = await Connection.count({
      where: {
        status: 'accepted',
        [Op.or]: [{ senderId: id }, { receiverId: id }]
      }
    });

    res.json({
      ...user.toJSON(),
      postCount,
      connectionCount
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update own profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, profileImage } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    await User.update(updateData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'profileImage', 'bio']
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (for discovery/search page)
const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { id: { [Op.ne]: userId } },
      attributes: ['id', 'name', 'role', 'profileImage', 'bio'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchUsers,
  getSuggestions,
  getUserProfile,
  updateProfile,
  getAllUsers
};
