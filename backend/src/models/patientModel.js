const { getConnection } = require('../config/database');

/**
 * Patient Model - Database operations for patients
 */

/**
 * Create a new patient
 * @param {number} userId - User ID
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} Created patient
 */
const createPatient = async (userId, patientData) => {
    const connection = await getConnection();
    
    try {
        const [result] = await connection.execute(
            `INSERT INTO patients (user_id, blood_group, allergies, emergency_contact, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [
                userId,
                patientData.bloodGroup || null,
                patientData.allergies || null,
                patientData.emergencyContact || null
            ]
        );
        
        return {
            id: result.insertId,
            userId,
            ...patientData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get patient by user ID with full details
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Patient with user and profile data
 */
const getPatientByUserId = async (userId) => {
    const connection = await getConnection();
    
    try {
        console.log('=== GET PATIENT BY USER ID DEBUG ===');
        console.log('Searching for patient with userId:', userId);
        
        const [rows] = await connection.execute(
            `SELECT p.id, p.user_id, p.blood_group, p.allergies, p.emergency_contact, p.created_at,
                    u.email, u.role, u.created_at as user_created_at, u.updated_at as user_updated_at,
                    pr.first_name, pr.last_name, pr.phone, pr.gender, pr.date_of_birth, pr.address,
                    pr.created_at as profile_created_at, pr.updated_at as profile_updated_at
             FROM patients p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             WHERE p.user_id = ?`,
            [userId]
        );
        
        console.log('Query returned', rows.length, 'rows');
        if (rows.length > 0) {
            console.log('Patient data found:', JSON.stringify(rows[0], null, 2));
        } else {
            console.log('No patient record found for userId:', userId);
            
            // Check if user exists in users table
            const [userRows] = await connection.execute(
                'SELECT id, email, role FROM users WHERE id = ?',
                [userId]
            );
            console.log('User exists:', userRows.length > 0 ? userRows[0] : 'No');
            
            // Check if profile exists
            const [profileRows] = await connection.execute(
                'SELECT * FROM profiles WHERE user_id = ?',
                [userId]
            );
            console.log('Profile exists:', profileRows.length > 0 ? profileRows[0] : 'No');
            
            // Check if patient record exists
            const [patientRows] = await connection.execute(
                'SELECT * FROM patients WHERE user_id = ?',
                [userId]
            );
            console.log('Patient record exists:', patientRows.length > 0 ? patientRows[0] : 'No');
        }
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('getPatientByUserId error:', error);
        throw error;
    }
};

/**
 * Get patient by ID with full details
 * @param {number} patientId - Patient ID
 * @returns {Promise<Object|null>} Patient with user and profile data
 */
const getPatientById = async (patientId) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT p.id, p.user_id, p.blood_group, p.allergies, p.emergency_contact, p.created_at,
                    u.email, u.role, u.created_at as user_created_at, u.updated_at as user_updated_at,
                    pr.first_name, pr.last_name, pr.phone, pr.gender, pr.date_of_birth, pr.address,
                    pr.created_at as profile_created_at, pr.updated_at as profile_updated_at
             FROM patients p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             WHERE p.id = ?`,
            [patientId]
        );
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Update patient information
 * @param {number} userId - User ID
 * @param {Object} patientData - Patient data to update
 * @returns {Promise<boolean>} Success status
 */
const updatePatient = async (userId, patientData) => {
    const connection = await getConnection();
    
    try {
        // Separate profile fields from patient-specific fields
        const profileFields = ['firstName', 'lastName', 'phone', 'gender', 'dateOfBirth', 'address'];
        const patientFields = ['bloodGroup', 'allergies', 'emergencyContact'];
        
        const profileUpdates = {};
        const patientUpdates = {};
        
        // Separate the data
        Object.keys(patientData).forEach(key => {
            if (patientData[key] !== undefined) {
                if (profileFields.includes(key)) {
                    profileUpdates[key] = patientData[key];
                } else if (patientFields.includes(key)) {
                    patientUpdates[key] = patientData[key];
                }
            }
        });
        
        // Update profiles table if there are profile fields
        if (Object.keys(profileUpdates).length > 0) {
            const profileFieldsQuery = [];
            const profileValues = [];
            
            Object.keys(profileUpdates).forEach(key => {
                // Map camelCase to snake_case for database
                const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                profileFieldsQuery.push(`${dbField} = ?`);
                profileValues.push(profileUpdates[key]);
            });
            
            profileValues.push(userId);
            
            await connection.execute(
                `UPDATE profiles SET ${profileFieldsQuery.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
                profileValues
            );
        }
        
        // Update patients table if there are patient-specific fields
        if (Object.keys(patientUpdates).length > 0) {
            const patientFieldsQuery = [];
            const patientValues = [];
            
            Object.keys(patientUpdates).forEach(key => {
                // Map camelCase to snake_case for database
                const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                patientFieldsQuery.push(`${dbField} = ?`);
                patientValues.push(patientUpdates[key]);
            });
            
            patientValues.push(userId);
            
            await connection.execute(
                `UPDATE patients SET ${patientFieldsQuery.join(', ')} WHERE user_id = ?`,
                patientValues
            );
        }
        
        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all patients with pagination and filters
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
        let whereConditions = ['u.role = "patient"'];
        let queryParams = [];
        
        // Search conditions
        if (search) {
            whereConditions.push(`(u.email LIKE ? OR pr.first_name LIKE ? OR pr.last_name LIKE ? OR pr.phone LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        // Filter conditions
        if (filters.gender) {
            whereConditions.push('pr.gender = ?');
            queryParams.push(filters.gender);
        }
        
        if (filters.bloodGroup) {
            whereConditions.push('p.blood_group = ?');
            queryParams.push(filters.bloodGroup);
        }
        
        if (filters.createdFrom) {
            whereConditions.push('p.created_at >= ?');
            queryParams.push(filters.createdFrom);
        }
        
        if (filters.createdTo) {
            whereConditions.push('p.created_at <= ?');
            queryParams.push(filters.createdTo + ' 23:59:59');
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        // Get total count
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM patients p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get patients
        const [rows] = await connection.query(
            `SELECT p.id, p.user_id, p.blood_group, p.allergies, p.emergency_contact, p.created_at,
                    u.email, u.created_at as user_created_at, u.updated_at as user_updated_at,
                    pr.first_name, pr.last_name, pr.phone, pr.gender, pr.date_of_birth, pr.address
             FROM patients p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             ${whereClause}
             ORDER BY p.${sortBy} ${sortOrder}
             LIMIT ${limit} OFFSET ${offset}`,
            queryParams
        );
        
        return {
            patients: rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get patient statistics
 * @param {number} patientId - Patient ID
 * @returns {Promise<Object>} Patient statistics
 */
const getPatientStats = async (patientId) => {
    const connection = await getConnection();
    
    try {
        // Total appointments
        const [totalAppointmentsRows] = await connection.execute(
            'SELECT COUNT(*) as total FROM appointments WHERE patient_id = ?',
            [patientId]
        );
        
        // Upcoming appointments
        const [upcomingAppointmentsRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments 
             WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('pending', 'confirmed')`,
            [patientId]
        );
        
        // Completed appointments
        const [completedAppointmentsRows] = await connection.execute(
            'SELECT COUNT(*) as total FROM appointments WHERE patient_id = ? AND status = "completed"',
            [patientId]
        );
        
        // Cancelled appointments
        const [cancelledAppointmentsRows] = await connection.execute(
            'SELECT COUNT(*) as total FROM appointments WHERE patient_id = ? AND status = "cancelled"',
            [patientId]
        );
        
        // Recent appointments (last 30 days)
        const [recentAppointmentsRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments 
             WHERE patient_id = ? AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
            [patientId]
        );
        
        // Appointments by status
        const [appointmentsByStatusRows] = await connection.execute(
            `SELECT status, COUNT(*) as count 
             FROM appointments 
             WHERE patient_id = ? 
             GROUP BY status`,
            [patientId]
        );
        
        return {
            totalAppointments: totalAppointmentsRows[0].total,
            upcomingAppointments: upcomingAppointmentsRows[0].total,
            completedAppointments: completedAppointmentsRows[0].total,
            cancelledAppointments: cancelledAppointmentsRows[0].total,
            recentAppointments: recentAppointmentsRows[0].total,
            appointmentsByStatus: appointmentsByStatusRows
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPatient,
    getPatientByUserId,
    getPatientById,
    updatePatient,
    getAllPatients,
    getPatientStats
};
