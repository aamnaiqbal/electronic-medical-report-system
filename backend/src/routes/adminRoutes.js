const express = require('express');
const { 
    getAllUsersAdmin,
    getUserByIdAdmin,
    deleteUserAdmin,
    updateUserRole,
    getAllDoctorsAdmin,
    getAllPatientsAdmin,
    getAllAppointmentsAdmin,
    getUserStatsAdmin,
    getDashboardOverview
} = require('../controllers/adminController');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { query } = require('../middleware/pagination');
const { 
    validate, 
    getUsersQuerySchema,
    getUserByIdSchema,
    deleteUserSchema,
    updateUserRoleParamsSchema,
    updateUserRoleSchema
} = require('../validators/userValidator');

const router = express.Router();

/**
 * Admin Routes
 * All routes are prefixed with /api/admin and require admin authentication
 */

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard overview
 * @access  Private (Admin only)
 */
router.get('/dashboard', authenticateToken, adminOnly, getDashboardOverview);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Private (Admin only)
 */
router.get('/users', 
    authenticateToken, 
    adminOnly, 
    query, 
    validate(getUsersQuerySchema), 
    getAllUsersAdmin
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', 
    authenticateToken, 
    adminOnly, 
    validate(getUserByIdSchema), 
    getUserByIdAdmin
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft or hard delete)
 * @access  Private (Admin only)
 */
router.delete('/users/:id', 
    authenticateToken, 
    adminOnly, 
    validate(deleteUserSchema), 
    deleteUserAdmin
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put('/users/:id/role', 
    authenticateToken, 
    adminOnly, 
    validate(updateUserRoleParamsSchema),
    validate(updateUserRoleSchema), 
    updateUserRole
);

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors with pagination and filters
 * @access  Private (Admin only)
 */
router.get('/doctors', 
    authenticateToken, 
    adminOnly, 
    query, 
    getAllDoctorsAdmin
);

/**
 * @route   GET /api/admin/patients
 * @desc    Get all patients with pagination and filters
 * @access  Private (Admin only)
 */
router.get('/patients', 
    authenticateToken, 
    adminOnly, 
    query, 
    getAllPatientsAdmin
);

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments with pagination and filters
 * @access  Private (Admin only)
 */
router.get('/appointments', 
    authenticateToken, 
    adminOnly, 
    query, 
    getAllAppointmentsAdmin
);

/**
 * @route   GET /api/admin/stats
 * @desc    Get user and system statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticateToken, adminOnly, getUserStatsAdmin);

module.exports = router;
