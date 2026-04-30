const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  bannerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['adminId'] }
  ]
});

module.exports = Group;
