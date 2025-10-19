const { 
    getAllUsers, 
    findUserById, 
    deleteUser, 
    updateUser, 
    getUserStats, 
    getAllDoctors, 
    getAllPatients 
} = require('../models/userModel');
const { getAppointmentsByDateRange } = require('../models/appointmentModel');
const { getConnection } = require('../config/database');
const { 
    successResponse, 
    errorResponse, 
    notFoundResponse, 
    forbiddenResponse 
} = require('../utils/responseHandler');

/**
 * Admin Controller
 * Handles admin-only operations for user management
 */

/**
 * Get all users with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsersAdmin = async (req, res) => {
    try {
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            search: req.search.query,
            filters: req.filters,
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await getAllUsers(options);
        
        return successResponse(
            res,
            200,
            'Users retrieved successfully',
            result.users,
            {
                pagination: result.pagination,
                search: req.search,
                filters: req.filters,
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get all users error:', error);
        return errorResponse(res, 500, 'Failed to retrieve users');
    }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserByIdAdmin = async (req, res) => {
    try {
        const userId = parseInt(req.validatedData.params.id);
        
        const user = await findUserById(userId);
        if (!user) {
            return notFoundResponse(res, 'User not found');
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return successResponse(
            res,
            200,
            'User retrieved successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Get user by ID error:', error);
        return errorResponse(res, 500, 'Failed to retrieve user');
    }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUserAdmin = async (req, res) => {
    try {
        const userId = parseInt(req.validatedData.params.id);
        const permanent = req.validatedData.query.permanent === 'true';
        
        // Check if user exists
        const user = await findUserById(userId);
        if (!user) {
            return notFoundResponse(res, 'User not found');
        }
        
        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return forbiddenResponse(res, 'Cannot delete your own account');
        }
        
        // Prevent deletion of other admins (optional business rule)
        if (user.role === 'admin' && req.user.role !== 'admin') {
            return forbiddenResponse(res, 'Cannot delete admin accounts');
        }
        
        const success = await deleteUser(userId, permanent);
        if (!success) {
            return errorResponse(res, 500, 'Failed to delete user');
        }
        
        const message = permanent 
            ? 'User permanently deleted successfully' 
            : 'User deleted successfully';
        
        return successResponse(res, 200, message);
        
    } catch (error) {
        console.error('Delete user error:', error);
        return errorResponse(res, 500, 'Failed to delete user');
    }
};

/**
 * Update user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserRole = async (req, res) => {
    try {
        const userId = parseInt(req.validatedData.params.id);
        const { role } = req.validatedData.body;
        
        // Check if user exists
        const user = await findUserById(userId);
        if (!user) {
            return notFoundResponse(res, 'User not found');
        }
        
        // Prevent admin from changing their own role
        if (userId === req.user.id) {
            return forbiddenResponse(res, 'Cannot change your own role');
        }
        
        // Update user role
        const success = await updateUser(userId, { role });
        if (!success) {
            return errorResponse(res, 500, 'Failed to update user role');
        }
        
        // Get updated user
        const updatedUser = await findUserById(userId);
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        return successResponse(
            res,
            200,
            'User role updated successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Update user role error:', error);
        return errorResponse(res, 500, 'Failed to update user role');
    }
};

/**
 * Get all doctors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDoctorsAdmin = async (req, res) => {
    try {
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            search: req.search.query,
            filters: req.filters,
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await getAllDoctors(options);
        
        return successResponse(
            res,
            200,
            'Doctors retrieved successfully',
            result.doctors,
            {
                pagination: result.pagination,
                search: req.search,
                filters: req.filters,
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get all doctors error:', error);
        return errorResponse(res, 500, 'Failed to retrieve doctors');
    }
};

/**
 * Get all patients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPatientsAdmin = async (req, res) => {
    try {
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            search: req.search.query,
            filters: req.filters,
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await getAllPatients(options);
        
        return successResponse(
            res,
            200,
            'Patients retrieved successfully',
            result.patients,
            {
                pagination: result.pagination,
                search: req.search,
                filters: req.filters,
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get all patients error:', error);
        return errorResponse(res, 500, 'Failed to retrieve patients');
    }
};

/**
 * Get all appointments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAppointmentsAdmin = async (req, res) => {
    try {
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            doctorId: req.query.doctorId,
            patientId: req.query.patientId,
            status: req.query.status,
            sortBy: req.sort.by || 'appointment_date',
            sortOrder: req.sort.order || 'DESC'
        };
        
        const result = await getAppointmentsByDateRange(options);
        
        return successResponse(
            res,
            200,
            'Appointments retrieved successfully',
            result.appointments,
            {
                pagination: result.pagination,
                filters: {
                    dateFrom: options.dateFrom,
                    dateTo: options.dateTo,
                    doctorId: options.doctorId,
                    patientId: options.patientId,
                    status: options.status
                },
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get all appointments error:', error);
        return errorResponse(res, 500, 'Failed to retrieve appointments');
    }
};

/**
 * Get user statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserStatsAdmin = async (req, res) => {
    try {
        const connection = await getConnection();
        
        // Get user statistics
        const userStats = await getUserStats();
        
        // Get appointment statistics
        const [appointmentStats] = await connection.execute(
            `SELECT 
                status,
                COUNT(*) as count
             FROM appointments 
             GROUP BY status`
        );
        
        // Get total appointments
        const [totalAppointments] = await connection.execute(
            'SELECT COUNT(*) as total FROM appointments'
        );
        
        // Get recent appointments (last 30 days)
        const [recentAppointments] = await connection.execute(
            'SELECT COUNT(*) as recent FROM appointments WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
        
        // Get appointments by month (last 12 months)
        const [monthlyAppointments] = await connection.execute(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
             FROM appointments 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY month
             ORDER BY month`
        );
        
        const stats = {
            users: userStats,
            appointments: {
                total: totalAppointments[0].total,
                byStatus: appointmentStats,
                recent: recentAppointments[0].recent,
                monthly: monthlyAppointments
            }
        };
        
        return successResponse(
            res,
            200,
            'Statistics retrieved successfully',
            stats
        );
        
    } catch (error) {
        console.error('Get user stats error:', error);
        return errorResponse(res, 500, 'Failed to retrieve statistics');
    }
};

/**
 * Get dashboard overview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardOverview = async (req, res) => {
    try {
        const connection = await getConnection();
        
        // Get basic counts
        const [totalUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [totalDoctors] = await connection.execute('SELECT COUNT(*) as count FROM doctors');
        const [totalPatients] = await connection.execute('SELECT COUNT(*) as count FROM patients');
        const [totalAppointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
        
        // Get recent activity
        const [recentUsers] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        
        const [recentAppointments] = await connection.execute(
            'SELECT COUNT(*) as count FROM appointments WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        
        // Get upcoming appointments
        const [upcomingAppointments] = await connection.execute(
            `SELECT COUNT(*) as count 
             FROM appointments 
             WHERE appointment_date >= CURDATE() 
             AND status IN ('pending', 'confirmed')`
        );
        
        const overview = {
            totals: {
                users: totalUsers[0].count,
                doctors: totalDoctors[0].count,
                patients: totalPatients[0].count,
                appointments: totalAppointments[0].count
            },
            recent: {
                users: recentUsers[0].count,
                appointments: recentAppointments[0].count
            },
            upcoming: {
                appointments: upcomingAppointments[0].count
            }
        };
        
        return successResponse(
            res,
            200,
            'Dashboard overview retrieved successfully',
            overview
        );
        
    } catch (error) {
        console.error('Get dashboard overview error:', error);
        return errorResponse(res, 500, 'Failed to retrieve dashboard overview');
    }
};

module.exports = {
    getAllUsersAdmin,
    getUserByIdAdmin,
    deleteUserAdmin,
    updateUserRole,
    getAllDoctorsAdmin,
    getAllPatientsAdmin,
    getAllAppointmentsAdmin,
    getUserStatsAdmin,
    getDashboardOverview
};
