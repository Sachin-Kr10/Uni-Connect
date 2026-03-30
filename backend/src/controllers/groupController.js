const { Group, GroupMember, User, Post } = require('../models');

// Create a new Group
const createGroup = async (req, res) => {
  try {
    const { name, description, bannerUrl } = req.body;
    const adminId = req.user.id; // User must be a club role ideally, but we'll let authMiddleware/frontend handle UX

    const group = await Group.create({
      name,
      description,
      bannerUrl,
      adminId
    });

    // Add admin as a member automatically
    await GroupMember.create({
      groupId: group.id,
      userId: adminId,
      role: 'admin'
    });

    res.status(201).json(group);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Group name already exists' });
    }
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all Groups (Directory)
const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join a Group
const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const existingMember = await GroupMember.findOne({
      where: { groupId, userId }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    const membership = await GroupMember.create({
      groupId,
      userId
    });

    res.status(201).json(membership);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Group Details (including posts)
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId, {
      include: [
        { model: User, as: 'Admin', attributes: ['id', 'name'] }
      ]
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if current user is a member
    const membership = await GroupMember.findOne({
      where: { groupId, userId }
    });

    // Get group posts
    const posts = await Post.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      group,
      isMember: !!membership,
      posts
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  joinGroup,
  getGroupDetails
};
