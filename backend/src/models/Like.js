const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'postId'] }, // A user can only like a post once
    { fields: ['postId'] }
  ]
});

module.exports = Like;
