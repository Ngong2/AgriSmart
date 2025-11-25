// =======================================================
//  AgriSmart Backend Server
// =======================================================

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const net = require('net');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');

// -------------------------------------------------------
//  App Initialization
// -------------------------------------------------------
const app = express();

// -------------------------------------------------------
//  Middleware
// -------------------------------------------------------
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://agri-smart-five.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------
//  Root Route
// -------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AgriSmart Backend API!',
    documentation: '/api/health',
  });
});

// -------------------------------------------------------
//  Routes
// -------------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// -------------------------------------------------------
//  Health Check
// -------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'AgriSmart API is running smoothly...',
    environment: process.env.NODE_ENV || 'development',
  });
});

// -------------------------------------------------------
//  Not Found handler for API routes
// -------------------------------------------------------
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Requested API endpoint was not found. Please verify the URL or consult the documentation at /api/health.'
    });
  }
  next();
});

// -------------------------------------------------------
//  Error Handler
// -------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------
//  Server Initialization
// -------------------------------------------------------
const startServer = async () => {
  try {
    await connectDB();

    let PORT = parseInt(process.env.PORT, 10) || 5001;
    const findAvailablePort = (port) =>
      new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.close(() => resolve(port));
        });
        server.on('error', () => resolve(findAvailablePort(port + 1)));
      });

    PORT = await findAvailablePort(PORT);

    app.listen(PORT, () => {
      console.log(`AgriSmart Server running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start AgriSmart Server:', error.message);
    process.exit(1);
  }
};

// -------------------------------------------------------
//  Start Server
// -------------------------------------------------------
startServer();
