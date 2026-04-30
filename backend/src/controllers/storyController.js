const { Story, User, Connection } = require('../models');
const { Op } = require('sequelize');

// Create a new story
const createStory = async (req, res) => {
  try {
    const { mediaUrl } = req.body;
    const userId = req.user.id;

    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL is required' });
    }

    const story = await Story.create({
      mediaUrl,
      userId,
    });

    const storyWithUser = await Story.findByPk(story.id, {
      include: [{ model: User, attributes: ['id', 'name', 'profileImage', 'role'] }]
    });

    res.status(201).json(storyWithUser);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active stories (last 24 hours)
// Visibility: club stories → all users, regular user stories → connections only
const getActiveStories = async (req, res) => {
  try {
    const reqUserId = req.user.id;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get accepted connection user IDs (same logic as post feed)
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

    // Club stories visible to all, user stories only to connections
    const stories = await Story.findAll({
      where: {
        createdAt: { [Op.gt]: twentyFourHoursAgo },
        [Op.or]: [
          { '$User.role$': 'club' },          // All club stories
          { userId: { [Op.in]: connectedUserIds } } // Connection stories + own stories
        ]
      },
      include: [{ model: User, attributes: ['id', 'name', 'profileImage', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    // Group stories by user (like Instagram)
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.User,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createStory,
  getActiveStories
};
