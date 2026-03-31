const { sequelize } = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Conversation = require('./Conversation');
const Message = require('./Message');
const OTP = require('./OTP');
const Story = require('./Story');

// --- User & Post ---
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

// --- Post & Comment ---
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// --- Post & Like ---
Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Like, { foreignKey: 'userId', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'userId' });

// --- Groups ---
User.hasMany(Group, { foreignKey: 'adminId', onDelete: 'CASCADE' }); // Admin
Group.belongsTo(User, { as: 'Admin', foreignKey: 'adminId' });

Group.hasMany(GroupMember, { foreignKey: 'groupId', onDelete: 'CASCADE' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(GroupMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

// Group Posts
Group.hasMany(Post, { foreignKey: 'groupId', onDelete: 'CASCADE' });
Post.belongsTo(Group, { foreignKey: 'groupId' });

// --- Chat ---
Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Message, { foreignKey: 'senderId', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId' });

// Group/Direct Participants (Simple N:M via intersection table if needed, 
// for simplicity in direct we just use conversations. 
// For a fully fleshed out chat, we'd add 'ConversationParticipant'.
const ConversationParticipant = sequelize.define('ConversationParticipant', {
  conversationId: { type: require('sequelize').DataTypes.UUID, allowNull: false },
  userId: { type: require('sequelize').DataTypes.UUID, allowNull: false }
}, { indexes: [{ unique: true, fields: ['conversationId', 'userId'] }] });

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(ConversationParticipant, { foreignKey: 'userId', onDelete: 'CASCADE' });
ConversationParticipant.belongsTo(User, { foreignKey: 'userId' });

// --- Stories ---
User.hasMany(Story, { foreignKey: 'userId', onDelete: 'CASCADE' });
Story.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Group,
  GroupMember,
  Conversation,
  Message,
  ConversationParticipant,
  OTP,
  Story
};
