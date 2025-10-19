const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { findUserById } = require('../models/userModel');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseHandler');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticateToken = async (req, res, next) => {
    try {
        console.log('=== AUTHENTICATION MIDDLEWARE DEBUG ===');
        console.log('Request URL:', req.url);
        console.log('Request method:', req.method);
        
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);
        
        const token = extractTokenFromHeader(authHeader);
        console.log('Extracted token:', token ? 'Present' : 'Missing');
        
        if (!token) {
            console.log('ERROR: No token found in request');
            return unauthorizedResponse(res, 'Access token is required');
        }
        
        // Verify token
        console.log('Verifying token...');
        const decoded = verifyToken(token);
        console.log('Token decoded successfully:', decoded);
        
        // Get user from database
        console.log('Fetching user from database, userId:', decoded.userId);
        const user = await findUserById(decoded.userId);
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('ERROR: User not found in database for userId:', decoded.userId);
            return unauthorizedResponse(res, 'User not found');
        }
        
        console.log('User doctorData from DB:', user.doctorData);
        console.log('User patientData from DB:', user.patientData);
        
        // Attach user to request object (without password)
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            dateOfBirth: user.date_of_birth,
            gender: user.gender,
            address: user.address,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            doctorData: user.doctorData,
            patientData: user.patientData
        };
        
        console.log('Authentication successful, user attached:', req.user.id, req.user.role);
        console.log('req.user.doctorData:', req.user.doctorData);
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        console.error('Error details:', error.message);
        
        if (error.message === 'Token has expired') {
            return unauthorizedResponse(res, 'Token has expired');
        } else if (error.message === 'Invalid token') {
            return unauthorizedResponse(res, 'Invalid token');
        } else {
            return unauthorizedResponse(res, 'Authentication failed');
        }
    }
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return unauthorizedResponse(res, 'Authentication required');
            }
            
            if (!allowedRoles.includes(req.user.role)) {
                return forbiddenResponse(res, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
            }
            
            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return forbiddenResponse(res, 'Authorization failed');
        }
    };
};

/**
 * Admin only middleware
 */
const adminOnly = authorizeRoles('admin');

/**
 * Doctor or Admin middleware
 */
const doctorOrAdmin = authorizeRoles('admin', 'doctor');

/**
 * Patient or Admin middleware
 */
const patientOrAdmin = authorizeRoles('admin', 'patient');

/**
 * Any authenticated user middleware
 */
const anyAuthenticated = (req, res, next) => {
    if (!req.user) {
        return unauthorizedResponse(res, 'Authentication required');
    }
    next();
};

/**
 * Optional authentication middleware
 * Verifies token if present but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);
        
        if (token) {
            const decoded = verifyToken(token);
            const user = await findUserById(decoded.userId);
            
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    dateOfBirth: user.date_of_birth,
                    gender: user.gender,
                    address: user.address,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                    doctorData: user.doctorData,
                    patientData: user.patientData
                };
            }
        }
        
        next();
    } catch (error) {
        // If token is invalid, continue without user
        next();
    }
};

/**
 * Check if user owns the resource
 * @param {string} userIdParam - Name of the parameter containing user ID
 * @returns {Function} Express middleware function
 */
const checkOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return unauthorizedResponse(res, 'Authentication required');
            }
            
            const resourceUserId = req.params[userIdParam];
            
            // Admin can access any resource
            if (req.user.role === 'admin') {
                return next();
            }
            
            // Check if user owns the resource
            if (parseInt(resourceUserId) !== req.user.id) {
                return forbiddenResponse(res, 'Access denied. You can only access your own resources');
            }
            
            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            return forbiddenResponse(res, 'Ownership verification failed');
        }
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    adminOnly,
    doctorOrAdmin,
    patientOrAdmin,
    anyAuthenticated,
    optionalAuth,
    checkOwnership
};
