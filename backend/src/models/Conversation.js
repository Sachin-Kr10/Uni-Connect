const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('direct', 'group'),
    defaultValue: 'direct'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true, // Only used for group chats
  }
}, {
  timestamps: true,
});

module.exports = Conversation;
