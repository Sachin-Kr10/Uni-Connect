const { Group, GroupMember, User, Post, Conversation, ConversationParticipant, Message } = require('../models');
const { Op } = require('sequelize');

// Create a new Group (club role only)
const createGroup = async (req, res) => {
  try {
    const { name, description, bannerUrl, imageUrl } = req.body;
    const adminId = req.user.id;

    // Only club role can create groups
    if (req.user.role !== 'club' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only club accounts can create communities' });
    }

    // Create a group conversation for chat
    const conversation = await Conversation.create({
      type: 'group',
      title: name
    });

    // Add admin as participant in conversation
    await ConversationParticipant.create({
      conversationId: conversation.id,
      userId: adminId
    });

    const group = await Group.create({
      name,
      description,
      bannerUrl,
      imageUrl,
      adminId,
      conversationId: conversation.id
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

// Get all Groups (Directory) with membership status
const getAllGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.findAll({
      include: [
        { model: User, as: 'Admin', attributes: ['id', 'name', 'profileImage'] },
        { model: GroupMember, attributes: ['userId'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = groups.map(g => {
      const gj = g.toJSON();
      gj.membersCount = gj.GroupMembers?.length || 0;
      gj.isMember = gj.GroupMembers?.some(m => m.userId === userId) || false;
      delete gj.GroupMembers;
      return gj;
    });

    res.json(result);
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

    // Add to group conversation
    if (group.conversationId) {
      await ConversationParticipant.create({
        conversationId: group.conversationId,
        userId
      }).catch(() => {}); // Ignore if already exists
    }

    res.status(201).json(membership);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Group Details (including posts and members)
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId, {
      include: [
        { model: User, as: 'Admin', attributes: ['id', 'name', 'profileImage'] }
      ]
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if current user is a member
    const membership = await GroupMember.findOne({
      where: { groupId, userId }
    });

    // Get members
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ['id', 'name', 'profileImage', 'role'] }]
    });

    // Get group posts
    const posts = await Post.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      group,
      isMember: !!membership,
      isAdmin: membership?.role === 'admin',
      members,
      posts
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Group (admin only)
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, description, imageUrl, bannerUrl } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.adminId !== userId) return res.status(403).json({ message: 'Only admin can edit' });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;

    await Group.update(updateData, { where: { id: groupId } });

    // Also update conversation title if name changed
    if (name && group.conversationId) {
      await Conversation.update({ title: name }, { where: { id: group.conversationId } });
    }

    const updated = await Group.findByPk(groupId);
    res.json(updated);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove Member (admin only)
const removeMember = async (req, res) => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const adminId = req.user.id;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.adminId !== adminId) return res.status(403).json({ message: 'Only admin can remove members' });
    if (targetUserId === adminId) return res.status(400).json({ message: 'Cannot remove yourself' });

    await GroupMember.destroy({ where: { groupId, userId: targetUserId } });

    // Remove from conversation
    if (group.conversationId) {
      await ConversationParticipant.destroy({
        where: { conversationId: group.conversationId, userId: targetUserId }
      });
    }

    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Group Chat Conversation ID
const getGroupChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check membership
    const membership = await GroupMember.findOne({ where: { groupId, userId } });
    if (!membership) return res.status(403).json({ message: 'You must be a member to access chat' });

    if (!group.conversationId) {
      // Create conversation if missing (for legacy groups)
      const conversation = await Conversation.create({ type: 'group', title: group.name });
      group.conversationId = conversation.id;
      await group.save();

      // Add all existing members
      const members = await GroupMember.findAll({ where: { groupId }, attributes: ['userId'] });
      await ConversationParticipant.bulkCreate(
        members.map(m => ({ conversationId: conversation.id, userId: m.userId })),
        { ignoreDuplicates: true }
      );
    }

    res.json({ conversationId: group.conversationId, groupName: group.name, isAdmin: group.adminId === userId });
  } catch (error) {
    console.error('Error getting group chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Group Message (admin only)
const deleteGroupMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.adminId !== userId) return res.status(403).json({ message: 'Only admin can delete messages' });

    const message = await Message.findOne({
      where: { id: messageId, conversationId: group.conversationId }
    });
    if (!message) return res.status(404).json({ message: 'Message not found' });

    await message.destroy();

    // Notify via socket
    if (req.io) {
      req.io.to(`conversation:${group.conversationId}`).emit('message_deleted', { messageId });
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting group message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  joinGroup,
  getGroupDetails,
  updateGroup,
  removeMember,
  getGroupChat,
  deleteGroupMessage
};
