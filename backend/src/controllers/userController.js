const { findUserById, updatePassword, verifyPassword } = require('../models/userModel');
const { updateProfile } = require('../models/profileModel');
const { getConnection } = require('../config/database');
const { 
    successResponse, 
    errorResponse, 
    unauthorizedResponse, 
    notFoundResponse 
} = require('../utils/responseHandler');

/**
 * User Controller
 * Handles user profile management and password changes
 */

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get fresh user data from database
        const user = await findUserById(userId);
        if (!user) {
            return notFoundResponse(res, 'User not found');
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return successResponse(
            res,
            200,
            'Profile retrieved successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse(res, 500, 'Failed to retrieve profile');
    }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = req.validatedData.body;
        
        // Update profile in database
        const success = await updateProfile(userId, profileData);
        
        if (!success) {
            return errorResponse(res, 500, 'Failed to update profile');
        }
        
        // Get updated user data
        const updatedUser = await findUserById(userId);
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        return successResponse(
            res,
            200,
            'Profile updated successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Update profile error:', error);
        return errorResponse(res, 500, 'Failed to update profile');
    }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changeUserPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.validatedData.body;
        
        // Get current user
        const user = await findUserById(userId);
        if (!user) {
            return notFoundResponse(res, 'User not found');
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
 * Update doctor-specific profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const doctorData = req.validatedData.body;
        
        // Check if user is a doctor
        if (req.user.role !== 'doctor') {
            return unauthorizedResponse(res, 'Only doctors can update doctor profile');
        }
        
        const connection = await getConnection();
        
        // Update doctor-specific data
        const fields = [];
        const values = [];
        
        Object.keys(doctorData).forEach(key => {
            if (doctorData[key] !== undefined) {
                const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                fields.push(`${dbField} = ?`);
                values.push(doctorData[key]);
            }
        });
        
        if (fields.length > 0) {
            values.push(userId);
            
            const [result] = await connection.execute(
                `UPDATE doctors SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
                values
            );
            
            if (result.affectedRows === 0) {
                return errorResponse(res, 500, 'Failed to update doctor profile');
            }
        }
        
        // Get updated user data
        const updatedUser = await findUserById(userId);
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        return successResponse(
            res,
            200,
            'Doctor profile updated successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Update doctor profile error:', error);
        return errorResponse(res, 500, 'Failed to update doctor profile');
    }
};

/**
 * Update patient-specific profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const patientData = req.validatedData.body;
        
        // Check if user is a patient
        if (req.user.role !== 'patient') {
            return unauthorizedResponse(res, 'Only patients can update patient profile');
        }
        
        const connection = await getConnection();
        
        // Update patient-specific data
        const fields = [];
        const values = [];
        
        Object.keys(patientData).forEach(key => {
            if (patientData[key] !== undefined) {
                const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                fields.push(`${dbField} = ?`);
                values.push(patientData[key]);
            }
        });
        
        if (fields.length > 0) {
            values.push(userId);
            
            const [result] = await connection.execute(
                `UPDATE patients SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
                values
            );
            
            if (result.affectedRows === 0) {
                return errorResponse(res, 500, 'Failed to update patient profile');
            }
        }
        
        // Get updated user data
        const updatedUser = await findUserById(userId);
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        return successResponse(
            res,
            200,
            'Patient profile updated successfully',
            { user: userWithoutPassword }
        );
        
    } catch (error) {
        console.error('Update patient profile error:', error);
        return errorResponse(res, 500, 'Failed to update patient profile');
    }
};

module.exports = {
    getProfile,
    updateUserProfile,
    changeUserPassword,
    updateDoctorProfile,
    updatePatientProfile
};
