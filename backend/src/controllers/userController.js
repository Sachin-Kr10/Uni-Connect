const { User } = require('../models');
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
          [Op.ne]: req.user.id // Exclude the current user from search results
        }
      },
      attributes: ['id', 'name', 'role'],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
};

// Get suggested users to follow
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Suggestions logic: users the current user isn't already following
    // For now, let's just return a random set of users excluding the current one
    const suggestions = await User.findAll({
      where: {
        id: {
          [Op.ne]: userId // Exclude self
        }
      },
      attributes: ['id', 'name', 'role'],
      limit: 5,
      order: [['createdAt', 'DESC']] // or random logic
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchUsers,
  getSuggestions
};
