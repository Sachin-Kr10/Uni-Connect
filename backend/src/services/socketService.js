const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const initSocket = (io) => {
  // Authentication Middleware for Socket.IO
  io.use((socket, next) => {
    try {
      // Trying to get token from handshake headers (Bearer token) or cookies
      let token = null;

      const authHeader = socket.handshake.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      // If no auth header, maybe it's in a cookie? (Less common for socket auth if using JWT access tokens, 
      // but we do have refreshToken in cookies. Standard is to pass Access Token in auth header on socket connect)
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token; // From client: io(url, { auth: { token: '...' } })
      }

      if (!token) {
        return next(new Error('Authentication Error: No token provided'));
      }

      jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication Error: Invalid token'));
        
        // Attach user to socket
        socket.user = decoded;
        next();
      });
    } catch (error) {
      next(new Error('Authentication Error: Server error'));
    }
  });

  // Handle Connections
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.id} (Socket ID: ${socket.id})`);

    // Automatically join a personal room based on User ID for direct notifications
    socket.join(`user:${socket.user.id}`);

    // Allow user to join specific conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket] User ${socket.user.id} joined conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`[Socket] User ${socket.user.id} left conversation:${conversationId}`);
    });

    // Custom events can be added here...
    
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.id}`);
    });
  });
};

module.exports = { initSocket };
