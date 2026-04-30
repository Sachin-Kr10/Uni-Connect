const { Connection, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Send connection request
const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    // Check if connection already exists in either direction
    const existing = await Connection.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Connection request already pending' });
      }
      if (existing.status === 'declined') {
        // Allow re-request after decline
        existing.senderId = senderId;
        existing.receiverId = receiverId;
        existing.status = 'pending';
        await existing.save();

        // Create notification
        const sender = await User.findByPk(senderId, { attributes: ['name'] });
        await Notification.create({
          userId: receiverId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: `${sender.name} wants to connect with you.`,
          referenceId: existing.id
        });

        // Real-time notification
        if (req.io) {
          req.io.to(`user:${receiverId}`).emit('new_notification', {
            type: 'connection_request',
            message: `${sender.name} wants to connect with you.`
          });
        }

        return res.json(existing);
      }
    }

    const connection = await Connection.create({ senderId, receiverId });

    // Create notification for receiver
    const sender = await User.findByPk(senderId, { attributes: ['name'] });
    await Notification.create({
      userId: receiverId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${sender.name} wants to connect with you.`,
      referenceId: connection.id
    });

    // Real-time notification
    if (req.io) {
      req.io.to(`user:${receiverId}`).emit('new_notification', {
        type: 'connection_request',
        message: `${sender.name} wants to connect with you.`
      });
    }

    res.status(201).json(connection);
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept connection request
const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });
    if (connection.receiverId !== userId) return res.status(403).json({ message: 'Not authorized' });
    if (connection.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });

    connection.status = 'accepted';
    await connection.save();

    // Notify sender
    const receiver = await User.findByPk(userId, { attributes: ['name'] });
    await Notification.create({
      userId: connection.senderId,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${receiver.name} accepted your connection request.`,
      referenceId: connection.id
    });

    if (req.io) {
      req.io.to(`user:${connection.senderId}`).emit('new_notification', {
        type: 'connection_accepted',
        message: `${receiver.name} accepted your connection request.`
      });
    }

    res.json(connection);
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Decline connection request
const declineRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });
    if (connection.receiverId !== userId) return res.status(403).json({ message: 'Not authorized' });

    connection.status = 'declined';
    await connection.save();

    res.json({ message: 'Connection declined' });
  } catch (error) {
    console.error('Error declining connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all accepted connections
const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await Connection.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'name', 'profileImage', 'role'] },
        { model: User, as: 'Receiver', attributes: ['id', 'name', 'profileImage', 'role'] }
      ]
    });

    // Map to return the "other" user
    const people = connections.map(c => {
      const other = c.senderId === userId ? c.Receiver : c.Sender;
      return { connectionId: c.id, user: other };
    });

    res.json(people);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check connection status with a specific user
const getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const connection = await Connection.findOne({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      }
    });

    if (!connection) {
      return res.json({ status: 'none', connectionId: null });
    }

    res.json({
      status: connection.status,
      connectionId: connection.id,
      isSender: connection.senderId === currentUserId
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending incoming requests
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.findAll({
      where: { receiverId: userId, status: 'pending' },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'name', 'profileImage', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove connection
const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    if (connection.senderId !== userId && connection.receiverId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await connection.destroy();
    res.json({ message: 'Connection removed' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  declineRequest,
  getConnections,
  getConnectionStatus,
  getPendingRequests,
  removeConnection
};
