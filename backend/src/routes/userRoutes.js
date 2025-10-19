const express = require('express');
const { 
    getProfile, 
    updateUserProfile, 
    changeUserPassword,
    updateDoctorProfile,
    updatePatientProfile 
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const {
    validate, 
    updateProfileSchema, 
    changePasswordSchema,
    updateDoctorProfileSchema,
    updatePatientProfileSchema 
} = require('../validators/userValidator');

const router = express.Router();

/**
 * User Routes
 * All routes are prefixed with /api/users and require authentication
 */

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, validate(updateProfileSchema), updateUserProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', authenticateToken, validate(changePasswordSchema), changeUserPassword);

/**
 * @route   PUT /api/users/doctor-profile
 * @desc    Update doctor-specific profile
 * @access  Private (Doctor only)
 */
router.put('/doctor-profile', authenticateToken, validate(updateDoctorProfileSchema), updateDoctorProfile);

/**
 * @route   PUT /api/users/patient-profile
 * @desc    Update patient-specific profile
 * @access  Private (Patient only)
 */
router.put('/patient-profile', authenticateToken, validate(updatePatientProfileSchema), updatePatientProfile);

module.exports = router;
