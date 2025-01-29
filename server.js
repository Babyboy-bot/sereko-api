require('dotenv').config();
const express = require('express');
const winston = require('winston');
const { initializeFirebase } = require('./src/services/firebaseService');
const { connectDatabase } = require('./src/services/databaseService');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
async function startServer() {
  try {
    // Initialize Firebase
    initializeFirebase();

    // Connect to Database
    await connectDatabase();

    // Import routes
    const userRoutes = require('./src/routes/userRoutes');
    const serviceRoutes = require('./src/routes/serviceRoutes');
    const bookingRoutes = require('./src/routes/bookingRoutes');
    const paymentRoutes = require('./src/routes/paymentRoutes');
    const notificationRoutes = require('./src/routes/notificationRoutes');

    // Use routes
    app.use('/api/users', userRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/notifications', notificationRoutes);

    // Endpoint de santé pour le monitoring
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    });

    // Start server
    app.listen(PORT, () => {
      logger.info(`Séréko server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
