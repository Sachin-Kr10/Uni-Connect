const { Notification } = require('../models');

// Get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      notifications: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ where: { id, userId } });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.count({ where: { userId, isRead: false } });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
