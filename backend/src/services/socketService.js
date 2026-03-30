const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// In-memory store for online users (userId -> Map of socketIds)
const onlineUsers = new Map();

const initSocket = (io) => {
  // Authentication Middleware for Socket.IO
  io.use((socket, next) => {
    try {
      let token = null;
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }
      if (!token) {
        return next(new Error('Authentication Error: No token provided'));
      }

      jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication Error: Invalid token'));
        socket.user = decoded;
        next();
      });
    } catch (error) {
      next(new Error('Authentication Error: Server error'));
    }
  });

  // Handle Connections
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket] User connected: ${userId} (Socket ID: ${socket.id})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Broadcast that user came online
      io.emit('user_online', userId);
    }
    onlineUsers.get(userId).add(socket.id);

    // Send the current list of online users to this newly connected socket
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    socket.join(`user:${userId}`);

    // Rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket] User ${userId} joined conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`[Socket] User ${userId} left conversation:${conversationId}`);
    });

    // Typing Indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      // Broadcast to others in the room
      socket.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        userId: socket.user.id,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast that user went offline
          io.emit('user_offline', userId);
        }
      }
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });
};

module.exports = { initSocket };
