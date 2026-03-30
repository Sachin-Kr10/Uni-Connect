const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true, // Allow null if it's just a media post
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: true, // If null, it's a general feed post; if not, it belongs to a club/group
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['groupId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Post;
