const { getConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model - Database operations for users and profiles
 */

/**
 * Create a new user with profile
 * @param {Object} userData - User data
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Created user with profile
 */
const createUser = async (userData, profileData) => {
    const pool = await getConnection();
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        
        // Insert user
        const [userResult] = await connection.execute(
            `INSERT INTO users (email, password, role, created_at, updated_at) 
             VALUES (?, ?, ?, NOW(), NOW())`,
            [userData.email, hashedPassword, userData.role]
        );
        
        const userId = userResult.insertId;
        
        // Insert profile
        await connection.execute(
            `INSERT INTO profiles (user_id, first_name, last_name, phone, date_of_birth, gender, address, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                userId,
                profileData.firstName,
                profileData.lastName,
                profileData.phone || null,
                profileData.dateOfBirth || null,
                profileData.gender || null,
                profileData.address || null
            ]
        );
        
        // Insert role-specific data
        if (userData.role === 'doctor' && userData.doctorData) {
            await connection.execute(
                `INSERT INTO doctors (user_id, specialization, license_number, qualification, experience_years, consultation_fee, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [
                    userId,
                    userData.doctorData.specialization,
                    userData.doctorData.licenseNumber,
                    userData.doctorData.qualification || null,
                    userData.doctorData.experienceYears || 0,
                    userData.doctorData.consultationFee || 0.00
                ]
            );
        } else if (userData.role === 'patient' && userData.patientData) {
            await connection.execute(
                `INSERT INTO patients (user_id, blood_group, allergies, emergency_contact, created_at) 
                 VALUES (?, ?, ?, ?, NOW())`,
                [
                    userId,
                    userData.patientData.bloodGroup || null,
                    userData.patientData.allergies || null,
                    userData.patientData.emergencyContact || null
                ]
            );
        }
        
        await connection.commit();
        
        // Return created user without password
        const createdUser = await findUserById(userId);
        return createdUser;
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Find user by email with profile data
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User with profile or null
 */
const findUserByEmail = async (email) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT u.id, u.email, u.password, u.role, u.created_at, u.updated_at,
                    p.first_name, p.last_name, p.phone, p.date_of_birth, p.gender, p.address,
                    p.created_at as profile_created_at, p.updated_at as profile_updated_at
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.email = ?`,
            [email]
        );
        
        if (rows.length === 0) return null;
        
        const user = rows[0];
        
        // Get role-specific data
        if (user.role === 'doctor') {
            const [doctorRows] = await connection.execute(
                `SELECT specialization, license_number, qualification, experience_years, consultation_fee, created_at
                 FROM doctors WHERE user_id = ?`,
                [user.id]
            );
            user.doctorData = doctorRows[0] || null;
        } else if (user.role === 'patient') {
            const [patientRows] = await connection.execute(
                `SELECT blood_group, allergies, emergency_contact, created_at
                 FROM patients WHERE user_id = ?`,
                [user.id]
            );
            user.patientData = patientRows[0] || null;
        }
        
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Find user by ID with profile data
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User with profile or null
 */
const findUserById = async (userId) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT u.id, u.email, u.password, u.role, u.created_at, u.updated_at,
                    p.first_name, p.last_name, p.phone, p.date_of_birth, p.gender, p.address,
                    p.created_at as profile_created_at, p.updated_at as profile_updated_at
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.id = ?`,
            [userId]
        );
        
        if (rows.length === 0) return null;
        
        const user = rows[0];
        
        // Get role-specific data
        if (user.role === 'doctor') {
            const [doctorRows] = await connection.execute(
                `SELECT id, specialization, license_number, qualification, experience_years, consultation_fee, created_at
                 FROM doctors WHERE user_id = ?`,
                [user.id]
            );
            user.doctorData = doctorRows[0] || null;
        } else if (user.role === 'patient') {
            const [patientRows] = await connection.execute(
                `SELECT id, blood_group, allergies, emergency_contact, created_at
                 FROM patients WHERE user_id = ?`,
                [user.id]
            );
            user.patientData = patientRows[0] || null;
        }
        
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user password
 * @param {number} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
const updatePassword = async (userId, newPassword) => {
    const connection = await getConnection();
    
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const [result] = await connection.execute(
            `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
            [hashedPassword, userId]
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<boolean>} Success status
 */
const updateProfile = async (userId, profileData) => {
    const connection = await getConnection();
    
    try {
        const fields = [];
        const values = [];
        
        // Build dynamic update query
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(profileData[key]);
            }
        });
        
        if (fields.length === 0) return true;
        
        values.push(userId);
        
        const [result] = await connection.execute(
            `UPDATE profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
const emailExists = async (email) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        return rows.length > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Verify password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw error;
    }
};

/**
 * Get all users with pagination and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search query
 * @param {Object} options.filters - Filter options
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order
 * @returns {Promise<Object>} Users with pagination info
 */
const getAllUsers = async (options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        // Ensure page and limit are integers
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;
        
        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];
        
        // Search conditions
        if (search) {
            whereConditions.push(`(u.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.phone LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        // Filter conditions
        if (filters.role) {
            whereConditions.push('u.role = ?');
            queryParams.push(filters.role);
        }
        
        if (filters.gender) {
            whereConditions.push('p.gender = ?');
            queryParams.push(filters.gender);
        }
        
        if (filters.createdFrom) {
            whereConditions.push('u.created_at >= ?');
            queryParams.push(filters.createdFrom);
        }
        
        if (filters.createdTo) {
            whereConditions.push('u.created_at <= ?');
            queryParams.push(filters.createdTo + ' 23:59:59');
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        // Get total count
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get users
        const sqlQuery = `SELECT u.id, u.email, u.role, u.created_at, u.updated_at,
                    p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             ${whereClause}
             ORDER BY u.${sortBy} ${sortOrder}
             LIMIT ${limitNum} OFFSET ${offset}`;
        
        const [rows] = await connection.query(sqlQuery, queryParams);
        
        return {
            users: rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Update user information
 * @param {number} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<boolean>} Success status
 */
const updateUser = async (userId, userData) => {
    const connection = await getConnection();
    
    try {
        const fields = [];
        const values = [];
        
        // Build dynamic update query
        Object.keys(userData).forEach(key => {
            if (userData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        });
        
        if (fields.length === 0) return true;
        
        values.push(userId);
        
        const [result] = await connection.execute(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete user (soft delete by updating status or hard delete)
 * @param {number} userId - User ID
 * @param {boolean} permanent - Whether to permanently delete
 * @returns {Promise<boolean>} Success status
 */
const deleteUser = async (userId, permanent = false) => {
    const connection = await getConnection();
    
    try {
        if (permanent) {
            // Hard delete - this will cascade to related tables
            const [result] = await connection.execute(
                'DELETE FROM users WHERE id = ?',
                [userId]
            );
            return result.affectedRows > 0;
        } else {
            // Soft delete - add a deleted_at field or status field
            // For now, we'll use a simple approach by updating email to mark as deleted
            const [result] = await connection.execute(
                'UPDATE users SET email = CONCAT(email, "_deleted_", UNIX_TIMESTAMP()), updated_at = NOW() WHERE id = ?',
                [userId]
            );
            return result.affectedRows > 0;
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Count users by role
 * @param {string} role - User role (optional)
 * @returns {Promise<number>} User count
 */
const countUsers = async (role = null) => {
    const connection = await getConnection();
    
    try {
        let query = 'SELECT COUNT(*) as count FROM users';
        let params = [];
        
        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }
        
        const [rows] = await connection.execute(query, params);
        return rows[0].count;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
const getUserStats = async () => {
    const connection = await getConnection();
    
    try {
        // Total users
        const [totalRows] = await connection.execute(
            'SELECT COUNT(*) as total FROM users'
        );
        
        // Users by role
        const [roleRows] = await connection.execute(
            'SELECT role, COUNT(*) as count FROM users GROUP BY role'
        );
        
        // Recent users (last 30 days)
        const [recentRows] = await connection.execute(
            'SELECT COUNT(*) as recent FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
        
        // Users by month (last 12 months)
        const [monthlyRows] = await connection.execute(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
             FROM users 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY month
             ORDER BY month`
        );
        
        return {
            total: totalRows[0].total,
            byRole: roleRows,
            recent: recentRows[0].recent,
            monthly: monthlyRows
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all doctors with their profiles
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Doctors with pagination info
 */
const getAllDoctors = async (options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        const pageNum = parseInt(page, 10) || 1; const limitNum = parseInt(limit, 10) || 10; const offset = (pageNum - 1) * limitNum;
        
        // Build WHERE clause
        let whereConditions = ['u.role = ?'];
        let queryParams = ['doctor'];
        
        // Search conditions
        if (search) {
            whereConditions.push(`(u.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR d.specialization LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        // Filter conditions
        if (filters.specialization) {
            whereConditions.push('d.specialization = ?');
            queryParams.push(filters.specialization);
        }
        
        if (filters.experienceMin) {
            whereConditions.push('d.experience_years >= ?');
            queryParams.push(filters.experienceMin);
        }
        
        if (filters.experienceMax) {
            whereConditions.push('d.experience_years <= ?');
            queryParams.push(filters.experienceMax);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        // Get total count
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             LEFT JOIN doctors d ON u.id = d.user_id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get doctors
        const [rows] = await connection.query(
            `SELECT u.id, u.email, u.created_at, u.updated_at,
                    p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address,
                    d.specialization, d.license_number, d.qualification, d.experience_years, d.consultation_fee
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             LEFT JOIN doctors d ON u.id = d.user_id
             ${whereClause}
             ORDER BY u.${sortBy} ${sortOrder}
             LIMIT ${limitNum} OFFSET ${offset}`,
            queryParams
        );
        
        return {
            doctors: rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all patients with their profiles
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Patients with pagination info
 */
const getAllPatients = async (options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        const pageNum = parseInt(page, 10) || 1; const limitNum = parseInt(limit, 10) || 10; const offset = (pageNum - 1) * limitNum;
        
        // Build WHERE clause
        let whereConditions = ['u.role = ?'];
        let queryParams = ['patient'];
        
        // Search conditions
        if (search) {
            whereConditions.push(`(u.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.phone LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        // Filter conditions
        if (filters.gender) {
            whereConditions.push('p.gender = ?');
            queryParams.push(filters.gender);
        }
        
        if (filters.bloodGroup) {
            whereConditions.push('pt.blood_group = ?');
            queryParams.push(filters.bloodGroup);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        // Get total count
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             LEFT JOIN patients pt ON u.id = pt.user_id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get patients
        const [rows] = await connection.query(
            `SELECT u.id, u.email, u.created_at, u.updated_at,
                    p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address,
                    pt.blood_group, pt.allergies, pt.emergency_contact
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             LEFT JOIN patients pt ON u.id = pt.user_id
             ${whereClause}
             ORDER BY u.${sortBy} ${sortOrder}
             LIMIT ${limitNum} OFFSET ${offset}`,
            queryParams
        );
        
        return {
            patients: rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updatePassword,
    updateProfile,
    emailExists,
    verifyPassword,
    getAllUsers,
    updateUser,
    deleteUser,
    countUsers,
    getUserStats,
    getAllDoctors,
    getAllPatients
};
