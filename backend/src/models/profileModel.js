const { getConnection } = require('../config/database');

/**
 * Profile Model - Database operations for user profiles
 */

/**
 * Create a new profile
 * @param {number} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Created profile
 */
const createProfile = async (userId, profileData) => {
    const connection = await getConnection();
    
    try {
        const [result] = await connection.execute(
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
        
        return {
            id: result.insertId,
            userId,
            ...profileData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get profile by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Profile or null
 */
const getProfileByUserId = async (userId) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT id, user_id, first_name, last_name, phone, date_of_birth, gender, address, 
                    created_at, updated_at
             FROM profiles 
             WHERE user_id = ?`,
            [userId]
        );
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Update profile
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
                // Map camelCase to snake_case for database
                const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                fields.push(`${dbField} = ?`);
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
 * Delete profile
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteProfile = async (userId) => {
    const connection = await getConnection();
    
    try {
        const [result] = await connection.execute(
            'DELETE FROM profiles WHERE user_id = ?',
            [userId]
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all profiles with pagination and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search query
 * @param {Object} options.filters - Filter options
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order
 * @returns {Promise<Object>} Profiles with pagination info
 */
const getAllProfiles = async (options = {}) => {
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
        
        const offset = (page - 1) * limit;
        
        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];
        
        // Search conditions
        if (search) {
            whereConditions.push(`(p.first_name LIKE ? OR p.last_name LIKE ? OR p.phone LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }
        
        // Filter conditions
        if (filters.gender) {
            whereConditions.push('p.gender = ?');
            queryParams.push(filters.gender);
        }
        
        if (filters.createdFrom) {
            whereConditions.push('p.created_at >= ?');
            queryParams.push(filters.createdFrom);
        }
        
        if (filters.createdTo) {
            whereConditions.push('p.created_at <= ?');
            queryParams.push(filters.createdTo + ' 23:59:59');
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        // Get total count
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM profiles p
             LEFT JOIN users u ON p.user_id = u.id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get profiles
        const [rows] = await connection.query(
            `SELECT p.id, p.user_id, p.first_name, p.last_name, p.phone, p.date_of_birth, 
                    p.gender, p.address, p.created_at, p.updated_at,
                    u.email, u.role, u.created_at as user_created_at
             FROM profiles p
             LEFT JOIN users u ON p.user_id = u.id
             ${whereClause}
             ORDER BY p.${sortBy} ${sortOrder}
             LIMIT ${limit} OFFSET ${offset}`,
            queryParams
        );
        
        return {
            profiles: rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get profile statistics
 * @returns {Promise<Object>} Profile statistics
 */
const getProfileStats = async () => {
    const connection = await getConnection();
    
    try {
        // Total profiles
        const [totalRows] = await connection.execute(
            'SELECT COUNT(*) as total FROM profiles'
        );
        
        // Profiles by gender
        const [genderRows] = await connection.execute(
            `SELECT gender, COUNT(*) as count 
             FROM profiles 
             WHERE gender IS NOT NULL 
             GROUP BY gender`
        );
        
        // Profiles by age groups
        const [ageRows] = await connection.execute(
            `SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'Under 18'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 30 THEN '18-30'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 31 AND 50 THEN '31-50'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 51 AND 70 THEN '51-70'
                    ELSE 'Over 70'
                END as age_group,
                COUNT(*) as count
             FROM profiles 
             WHERE date_of_birth IS NOT NULL 
             GROUP BY age_group`
        );
        
        // Recent profiles (last 30 days)
        const [recentRows] = await connection.execute(
            `SELECT COUNT(*) as recent 
             FROM profiles 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        );
        
        return {
            total: totalRows[0].total,
            byGender: genderRows,
            byAgeGroup: ageRows,
            recent: recentRows[0].recent
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createProfile,
    getProfileByUserId,
    updateProfile,
    deleteProfile,
    getAllProfiles,
    getProfileStats
};
