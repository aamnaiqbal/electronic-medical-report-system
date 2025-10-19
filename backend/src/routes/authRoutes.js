const express = require('express');
const { register, login, logout, getMe, changePassword, refreshToken } = require('../controllers/authController');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidator');

const router = express.Router();

/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Private (Admin only)
 */
router.post('/register', authenticateToken, adminOnly, validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, getMe);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, validate(changePasswordSchema), changePassword);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
