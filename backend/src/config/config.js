require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    
    // Database configuration
    database: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        name: process.env.DATABASE_NAME,
        port: process.env.DATABASE_PORT
    },
    
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    },
    
    // CORS configuration
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    },
    
    // Rate limiting configuration
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    },
    
    // Security configuration
    security: {
        bcryptRounds: 12,
        maxLoginAttempts: 5,
        lockoutTime: 30 * 60 * 1000 // 30 minutes
    },
    
    // Pagination configuration
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    },
    
    // File upload configuration
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    }
};

// Validate required environment variables
const requiredEnvVars = [
    'DATABASE_HOST',
    'DATABASE_USER', 
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
    console.warn('Using default values. Please set these in your .env file for production.');
}

module.exports = config;
