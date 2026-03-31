const { Story, User } = require('../models');
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
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.status(201).json(storyWithUser);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active stories (last 24 hours)
const getActiveStories = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.findAll({
      where: {
        createdAt: {
          [Op.gt]: twentyFourHoursAgo
        }
      },
      include: [{ model: User, attributes: ['id', 'name'] }],
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
