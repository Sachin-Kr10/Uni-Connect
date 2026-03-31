const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    // Using a virtual field or simple logic in controllers to filter out stories > 24h
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Story;
