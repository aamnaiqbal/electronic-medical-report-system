const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./src/config/config');
const { testConnection } = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const patientRoutes = require('./src/routes/patientRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials
}));
console.log('CORS Origin:', config.cors.origin);

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: config.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Healthcare Backend API is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API routes
app.get('/', (req, res) => {
    res.json({
        message: 'Healthcare Management System API',
        version: '1.0.0',
        documentation: '/api/docs',
        health: '/health'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

app.use('/api/v1/appointments', (req, res) => {
    res.json({ message: 'Appointment routes - Coming soon' });
});

app.use('/api/v1/medical-records', (req, res) => {
    res.json({ message: 'Medical record routes - Coming soon' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(config.nodeEnv === 'development' && { stack: err.stack })
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Server not started.');
            process.exit(1);
        }

        // Start HTTP server
        const server = app.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📊 Environment: ${config.nodeEnv}`);
            console.log(`🌐 API URL: http://localhost:${config.port}`);
            console.log(`❤️  Health check: http://localhost:${config.port}/health`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Promise Rejection at:', promise, 'reason:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
