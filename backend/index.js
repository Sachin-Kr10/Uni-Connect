const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');

// Import centralized DB configuration & models
const { sequelize } = require('./src/models/index');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const groupRoutes = require('./src/routes/groupRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up HTTP Server for Express and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  }
});

// Pass Socket.IO to req to use in controllers if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => {

  res.send('Uni-Connect API is running');
});

const { initSocket } = require('./src/services/socketService');

// Basic Socket Configuration
initSocket(io);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
    // Sync associations
    await sequelize.sync({ alter: true }); 
    console.log('Database synced.');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();


