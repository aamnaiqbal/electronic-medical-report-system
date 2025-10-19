const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @param {Object} additionalPayload - Additional data to include in token
 * @returns {string} JWT token
 */
const generateToken = (userId, role, additionalPayload = {}) => {
    const payload = {
        userId,
        role,
        ...additionalPayload
    };

    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'healthcare-api',
        audience: 'healthcare-client'
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret, {
            issuer: 'healthcare-api',
            audience: 'healthcare-client'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    
    return parts[1];
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    extractTokenFromHeader
};
