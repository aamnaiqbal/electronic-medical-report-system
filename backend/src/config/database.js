const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get a promise-based connection from the pool
const getConnection = () => {
    return pool.promise();
};

// Test database connection
const testConnection = async () => {
    try {
        const connection = await getConnection();
        await connection.execute('SELECT 1');
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Close all connections in the pool
const closePool = () => {
    return new Promise((resolve, reject) => {
        pool.end((err) => {
            if (err) {
                console.error('Error closing database pool:', err);
                reject(err);
            } else {
                console.log('Database pool closed');
                resolve();
            }
        });
    });
};

module.exports = {
    pool,
    getConnection,
    testConnection,
    closePool
};
