const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { connectDB, sequelize } = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Uni-Connect API is running');
});

// Start server
const startServer = async () => {
  await connectDB();
  
  // Sync database models (creates tables if they don't exist)
  // { alter: true } updates existing tables to match models
  await sequelize.sync({ alter: true }); 
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
