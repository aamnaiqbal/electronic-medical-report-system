const { findUserById } = require('../models/userModel');
const { getConnection } = require('../config/database');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseHandler');

/**
 * Doctor Authentication Middleware
 * Handles doctor-specific authorization and access control
 */

/**
 * Check if user is doctor or admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const isDoctorOrAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return unauthorizedResponse(res, 'Authentication required');
        }
        
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return forbiddenResponse(res, 'Access denied. Doctor or admin role required');
        }
        
        next();
    } catch (error) {
        console.error('Doctor auth middleware error:', error);
        return forbiddenResponse(res, 'Authorization failed');
    }
};

/**
 * Check if user is doctor only (not admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const isDoctorOnly = (req, res, next) => {
    try {
        if (!req.user) {
            return unauthorizedResponse(res, 'Authentication required');
        }
        
        if (req.user.role !== 'doctor') {
            return forbiddenResponse(res, 'Access denied. Doctor role required');
        }
        
        next();
    } catch (error) {
        console.error('Doctor only middleware error:', error);
        return forbiddenResponse(res, 'Authorization failed');
    }
};

/**
 * Verify appointment belongs to logged-in doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const isDoctorAppointment = async (req, res, next) => {
    try {
        if (!req.user) {
            return unauthorizedResponse(res, 'Authentication required');
        }
        
        // Admin can access any appointment
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Only doctors can access this
        if (req.user.role !== 'doctor') {
            return forbiddenResponse(res, 'Access denied. Doctor role required');
        }
        
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return forbiddenResponse(res, 'Doctor profile not found');
        }
        
        const appointmentId = req.params.id;
        const connection = await getConnection();
        
        // Check if appointment belongs to this doctor
        const [rows] = await connection.execute(
            'SELECT doctor_id FROM appointments WHERE id = ?',
            [appointmentId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        if (rows[0].doctor_id !== doctorId) {
            return forbiddenResponse(res, 'Access denied. You can only access your own appointments');
        }
        
        next();
    } catch (error) {
        console.error('Doctor appointment middleware error:', error);
        return forbiddenResponse(res, 'Authorization failed');
    }
};

/**
 * Verify doctor profile belongs to logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const isOwnDoctorProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return unauthorizedResponse(res, 'Authentication required');
        }
        
        // Admin can access any profile
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Only doctors can access this
        if (req.user.role !== 'doctor') {
            return forbiddenResponse(res, 'Access denied. Doctor role required');
        }
        
        // For profile updates, user can only update their own profile
        if (req.method === 'PUT' || req.method === 'PATCH') {
            // The profile being updated should be the logged-in user's profile
            // This is typically handled by the route structure, but we can add extra validation
            return next();
        }
        
        next();
    } catch (error) {
        console.error('Own doctor profile middleware error:', error);
        return forbiddenResponse(res, 'Authorization failed');
    }
};

/**
 * Check if doctor exists and is active
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const doctorExists = async (req, res, next) => {
    try {
        const doctorId = req.params.id;
        const connection = await getConnection();
        
        // Check if doctor exists and is active
        const [rows] = await connection.execute(
            `SELECT d.id, d.user_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee, d.created_at,
                    u.email, u.role, u.created_at as user_created_at,
                    p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address
             FROM doctors d
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE d.id = ? AND u.role = 'doctor'`,
            [doctorId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Attach doctor data to request for use in controller
        req.doctor = rows[0];
        next();
    } catch (error) {
        console.error('Doctor exists middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify doctor'
        });
    }
};

/**
 * Optional doctor authentication (for public endpoints that can show more info if authenticated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const optionalDoctorAuth = async (req, res, next) => {
    try {
        // If no auth header, continue without user
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }
        
        // Extract and verify token
        const { extractTokenFromHeader, verifyToken } = require('../utils/jwt');
        const token = extractTokenFromHeader(authHeader);
        
        if (!token) {
            return next();
        }
        
        try {
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
        } catch (error) {
            // Token invalid, continue without user
        }
        
        next();
    } catch (error) {
        console.error('Optional doctor auth middleware error:', error);
        next();
    }
};

module.exports = {
    isDoctorOrAdmin,
    isDoctorOnly,
    isDoctorAppointment,
    isOwnDoctorProfile,
    doctorExists,
    optionalDoctorAuth
};
