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

module.exports = {
  searchUsers
};
