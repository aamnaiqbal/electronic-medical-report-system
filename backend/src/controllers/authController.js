const { createUser, findUserByEmail, findUserById, emailExists, verifyPassword, updatePassword } = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const { 
    successResponse, 
    errorResponse, 
    validationErrorResponse, 
    unauthorizedResponse, 
    conflictResponse 
} = require('../utils/responseHandler');

/**
 * Authentication Controller
 * Handles user registration, login, logout, and profile management
 */

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    console.log(req.body)
    console.log('Registration request received', req.validatedData.body);
    try {
        const { body } = req.validatedData;
        const { email, password, role, firstName, lastName, phone, dateOfBirth, gender, address, ...roleSpecificData } = body;
        
        // Check if email already exists
        const existingUser = await emailExists(email);
        if (existingUser) {
            return conflictResponse(res, 'Email already registered');
        }
        
        // Prepare user data
        const userData = {
            email,
            password,
            role
        };
        
        // Prepare profile data
        const profileData = {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            address
        };
        
        // Add role-specific data
        if (role === 'doctor') {
            const { specialization, licenseNumber, qualification, experienceYears, consultationFee } = roleSpecificData;
            
            if (!specialization || !licenseNumber) {
                return validationErrorResponse(res, [
                    { field: 'specialization', message: 'Specialization is required for doctors' },
                    { field: 'licenseNumber', message: 'License number is required for doctors' }
                ]);
            }
            
            userData.doctorData = {
                specialization,
                licenseNumber,
                qualification,
                experienceYears: experienceYears || 0,
                consultationFee: consultationFee || 0.00
            };
        } else if (role === 'patient') {
            const { bloodGroup, allergies, emergencyContact } = roleSpecificData;
            
            userData.patientData = {
                bloodGroup,
                allergies,
                emergencyContact
            };
        }
        
        // Create user
        const newUser = await createUser(userData, profileData);
        
        // Generate JWT token
        const token = generateToken(newUser.id, newUser.role);
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;
        
        return successResponse(
            res,
            201,
            'User registered successfully',
            {
                user: userWithoutPassword,
                token
            }
        );
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return conflictResponse(res, 'Email or license number already exists');
        }
        
        return errorResponse(res, 500, 'Registration failed');
    }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    console.log('Login request received', req.body);
    try {
        const { email, password } = req.validatedData.body;
        
        // Find user by email
        const user = await findUserByEmail(email);
        console.log('User found:', user);
        if (!user) {
            return unauthorizedResponse(res, 'Invalid email or password');
        }
        
        // Verify password
        // const isPasswordValid = await verifyPassword(password, user.password);
        // if (!isPasswordValid) {
        //     return unauthorizedResponse(res, 'Invalid email or password');
        // }
        
        // Generate JWT token
        const token = generateToken(user.id, user.role);
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return successResponse(
            res,
            200,
            'Login successful',
            {
                user: userWithoutPassword,
                token
            }
        );
        
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 500, 'Login failed');
    }
};

/**
 * Logout user (optional - for token blacklist in future)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
    try {
        // In a more advanced implementation, you would:
        // 1. Add token to blacklist
        // 2. Store blacklisted tokens in Redis or database
        // 3. Check blacklist in authenticateToken middleware
        
        return successResponse(res, 200, 'Logout successful');
        
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(res, 500, 'Logout failed');
    }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get fresh user data from database
        const user = await findUserById(userId);
        if (!user) {
            return unauthorizedResponse(res, 'User not found');
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return successResponse(
            res,
            200,
            'User profile retrieved successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse(res, 500, 'Failed to retrieve profile');
    }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.validatedData.body;
        
        // Get current user
        const user = await findUserById(userId);
        if (!user) {
            return unauthorizedResponse(res, 'User not found');
        }
        
        // Verify current password
        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return unauthorizedResponse(res, 'Current password is incorrect');
        }
        
        // Update password
        const success = await updatePassword(userId, newPassword);
        if (!success) {
            return errorResponse(res, 500, 'Failed to update password');
        }
        
        return successResponse(res, 200, 'Password updated successfully');
        
    } catch (error) {
        console.error('Change password error:', error);
        return errorResponse(res, 500, 'Failed to update password');
    }
};

/**
 * Refresh JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Generate new token
        const newToken = generateToken(userId, userRole);
        
        return successResponse(
            res,
            200,
            'Token refreshed successfully',
            { token: newToken }
        );
        
    } catch (error) {
        console.error('Refresh token error:', error);
        return errorResponse(res, 500, 'Failed to refresh token');
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    changePassword,
    refreshToken
};
