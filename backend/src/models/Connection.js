const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Connection = sequelize.define('Connection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['senderId', 'receiverId'] },
    { fields: ['receiverId'] },
    { fields: ['status'] }
  ]
});

module.exports = Connection;
