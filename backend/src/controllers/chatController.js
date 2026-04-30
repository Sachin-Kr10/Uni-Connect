const { Conversation, Message, User, ConversationParticipant } = require('../models');
const { Op } = require('sequelize');

// Create or Get a Direct Conversation
const getOrCreateDirectConversation = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    // Check if conversation already exists where both are participants and type is direct
    const currentUserConversations = await ConversationParticipant.findAll({
      where: { userId: currentUserId },
      attributes: ['conversationId']
    });

    const targetUserConversations = await ConversationParticipant.findAll({
      where: { userId: targetUserId },
      attributes: ['conversationId']
    });

    const currentConvoIds = currentUserConversations.map(c => c.conversationId);
    const targetConvoIds = targetUserConversations.map(c => c.conversationId);

    const commonConvoIds = currentConvoIds.filter(id => targetConvoIds.includes(id));

    let conversation = await Conversation.findOne({
      where: {
        id: commonConvoIds,
        type: 'direct'
      }
    });

    if (!conversation) {
      // Create new
      conversation = await Conversation.create({ type: 'direct' });
      await ConversationParticipant.bulkCreate([
        { conversationId: conversation.id, userId: currentUserId },
        { conversationId: conversation.id, userId: targetUserId }
      ]);
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error in getOrCreateDirectConversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's conversations
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await ConversationParticipant.findAll({
      where: { userId }
    });

    const conversationIds = participations.map(p => p.conversationId);

    const conversations = await Conversation.findAll({
      where: { id: conversationIds, type: 'direct' },
      include: [
        {
          model: ConversationParticipant,
          include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }]
        },
        {
          model: Message, // Get the latest message
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Verify participation
    const isParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId }
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized for this conversation' });
    }

    const messages = await Message.findAll({
      where: { conversationId },
      include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a Message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    // Verify participation
    const isParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId: senderId }
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content
    });

    // Update conversation updatedAt for sorting
    await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId } });

    const messageWithUser = await Message.findByPk(message.id, {
      include: [{ model: User, attributes: ['id', 'name', 'profileImage'] }]
    });

    // Emit real-time event
    req.io.to(`conversation:${conversationId}`).emit('new_message', messageWithUser);

    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getOrCreateDirectConversation,
  getUserConversations,
  getMessages,
  sendMessage
};
