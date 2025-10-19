const { getConnection } = require('../config/database');

/**
 * Doctor Model - Database operations for doctors
 */

/**
 * Create a new doctor
 * @param {number} userId - User ID
 * @param {Object} doctorData - Doctor data
 * @returns {Promise<Object>} Created doctor
 */
const createDoctor = async (userId, doctorData) => {
    const connection = await getConnection();
    
    try {
        const [result] = await connection.execute(
            `INSERT INTO doctors (user_id, specialization, license_number, qualification, experience_years, consultation_fee, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                userId,
                doctorData.specialization,
                doctorData.licenseNumber,
                doctorData.qualification || null,
                doctorData.experienceYears || 0,
                doctorData.consultationFee || 0.00
            ]
        );
        
        return {
            id: result.insertId,
            userId,
            ...doctorData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get doctor by user ID with full details
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Doctor with user and profile data
 */
const getDoctorByUserId = async (userId) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT d.id, d.user_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee, d.created_at,
                    u.email, u.role, u.created_at as user_created_at, u.updated_at as user_updated_at,
                    p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address,
                    p.created_at as profile_created_at, p.updated_at as profile_updated_at
             FROM doctors d
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE d.user_id = ?`,
            [userId]
        );
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Get doctor by ID with full details
 * @param {number} doctorId - Doctor ID
 * @returns {Promise<Object|null>} Doctor with user and profile data
 */
const getDoctorById = async (doctorId) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT d.id, d.user_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee, d.created_at,
                    u.email, u.role, u.created_at as user_created_at, u.updated_at as user_updated_at,
                    p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address,
                    p.created_at as profile_created_at, p.updated_at as profile_updated_at
             FROM doctors d
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE d.id = ?`,
            [doctorId]
        );
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Update doctor information
 * @param {number} userId - User ID
 * @param {Object} doctorData - Doctor data to update
 * @returns {Promise<boolean>} Success status
 */
const updateDoctor = async (userId, doctorData) => {
    const connection = await getConnection();
    
    try {
        const fields = [];
        const values = [];
        
        // Build dynamic update query
        Object.keys(doctorData).forEach(key => {
            if (doctorData[key] !== undefined) {
                // Map camelCase to snake_case for database
                const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                fields.push(`${dbField} = ?`);
                values.push(doctorData[key]);
            }
        });
        
        if (fields.length === 0) return true;
        
        values.push(userId);
        
        const [result] = await connection.execute(
            `UPDATE doctors SET ${fields.join(', ')} WHERE user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all doctors with pagination and filters (Fixed version)
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

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE clause
        let whereConditions = ['u.role = ?'];
        let queryParams = ['doctor'];

        // Search conditions
        if (search) {
            whereConditions.push(`(p.first_name LIKE ? OR p.last_name LIKE ? OR d.specialization LIKE ? OR u.email LIKE ?)`);
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

        if (filters.feeMin) {
            whereConditions.push('d.consultation_fee >= ?');
            queryParams.push(filters.feeMin);
        }

        if (filters.feeMax) {
            whereConditions.push('d.consultation_fee <= ?');
            queryParams.push(filters.feeMax);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        // Get total count
        const [countRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM doctors d
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;

        // ✅ Fix: Use template literals for LIMIT/OFFSET instead of placeholders
        const sql = `
            SELECT d.id, d.user_id, d.specialization, d.license_number, d.qualification, 
                   d.experience_years, d.consultation_fee, d.created_at,
                   u.email, u.created_at as user_created_at, u.updated_at as user_updated_at,
                   p.first_name, p.last_name, p.phone, p.gender, p.date_of_birth, p.address
            FROM doctors d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            ${whereClause}
            ORDER BY d.${sortBy} ${sortOrder}
            LIMIT ${Number(limitNum)} OFFSET ${Number(offset)}
        `;

        // ✅ Use .query instead of .execute for dynamic LIMIT/OFFSET
        const [rows] = await connection.query(sql, queryParams);

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
        console.error("getAllDoctors error:", error);
        throw error;
    }
};

/**
 * Search doctors by name, specialization, etc.
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results with pagination
 */
const searchDoctors = async (options = {}) => {
    return getAllDoctors(options);
};

/**
 * Get doctor's appointments with patient details
 * @param {number} doctorId - Doctor ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Appointments with pagination info
 */
const getDoctorAppointments = async (doctorId, options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 10,
            status = null,
            date = null,
            dateFrom = null,
            dateTo = null,
            sortBy = 'appointment_date',
            sortOrder = 'ASC'
        } = options;
        
        const pageNum = parseInt(page, 10) || 1; const limitNum = parseInt(limit, 10) || 10; const offset = (pageNum - 1) * limitNum;
        
        // Build WHERE clause
        let whereConditions = ['a.doctor_id = ?'];
        let queryParams = [doctorId];
        
        // Status filter
        if (status) {
            whereConditions.push('a.status = ?');
            queryParams.push(status);
        }
        
        // Date filter
        if (date) {
            whereConditions.push('a.appointment_date = ?');
            queryParams.push(date);
        }
        
        // Date range filters
        if (dateFrom) {
            whereConditions.push('a.appointment_date >= ?');
            queryParams.push(dateFrom);
        }
        
        if (dateTo) {
            whereConditions.push('a.appointment_date <= ?');
            queryParams.push(dateTo);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        // Get total count
        const [countRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments a
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get appointments with patient details
        const [rows] = await connection.query(
            `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    u.id as patient_user_id, u.email as patient_email, u.created_at as patient_created_at,
                    pr.first_name as patient_first_name, pr.last_name as patient_last_name, 
                    pr.phone as patient_phone, pr.gender as patient_gender, 
                    pr.date_of_birth as patient_date_of_birth, pr.address as patient_address
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             ${whereClause}
             ORDER BY a.${sortBy} ${sortOrder}
             LIMIT ${limitNum} OFFSET ${offset}`,
            queryParams
        );
        
        return {
            appointments: rows,
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
 * Get doctor's unique patients
 * @param {number} doctorId - Doctor ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Patients with pagination info
 */
const getDoctorPatients = async (doctorId, options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'patient_name',
            sortOrder = 'ASC'
        } = options;
        
        const pageNum = parseInt(page, 10) || 1; const limitNum = parseInt(limit, 10) || 10; const offset = (pageNum - 1) * limitNum;
        
        // Map sortBy to actual column names
        const sortByMap = {
            'patient_name': 'pr.first_name',
            'email': 'u.email',
            'created_at': 'u.created_at',
            'last_appointment': 'last_appointment_date',
            'appointment_count': 'appointment_count'
        };
        
        const orderByColumn = sortByMap[sortBy] || 'pr.first_name';
        
        // Build WHERE clause
        let whereConditions = ['a.doctor_id = ?'];
        let queryParams = [doctorId];
        
        // Search conditions
        if (search) {
            whereConditions.push(`(pr.first_name LIKE ? OR pr.last_name LIKE ? OR u.email LIKE ? OR pr.phone LIKE ?)`);
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        
        // Get total count
        const [countRows] = await connection.execute(
            `SELECT COUNT(DISTINCT p.id) as total 
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get unique patients with appointment count
        const [rows] = await connection.query(
            `SELECT p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    u.id as patient_user_id, u.email as patient_email, u.created_at as patient_created_at,
                    pr.first_name as patient_first_name, pr.last_name as patient_last_name, 
                    pr.phone as patient_phone, pr.gender as patient_gender, 
                    pr.date_of_birth as patient_date_of_birth, pr.address as patient_address,
                    COUNT(a.id) as appointment_count,
                    MAX(a.appointment_date) as last_appointment_date
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             ${whereClause}
             GROUP BY p.id, u.id, pr.id
             ORDER BY ${orderByColumn} ${sortOrder}
             LIMIT ${limitNum} OFFSET ${offset}`,
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
 * Get doctor statistics
 * @param {number} doctorId - Doctor ID
 * @returns {Promise<Object>} Doctor statistics
 */
const getDoctorStats = async (doctorId) => {
    const connection = await getConnection();
    
    try {
        // Total patients
        const [totalPatientsRows] = await connection.execute(
            `SELECT COUNT(DISTINCT p.id) as total 
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             WHERE a.doctor_id = ?`,
            [doctorId]
        );
        
        // Today's appointments
        const [todayAppointmentsRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments 
             WHERE doctor_id = ? AND appointment_date = CURDATE()`,
            [doctorId]
        );
        
        // Upcoming appointments
        const [upcomingAppointmentsRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments 
             WHERE doctor_id = ? AND appointment_date >= CURDATE() AND status IN ('pending', 'confirmed')`,
            [doctorId]
        );
        
        // Completed appointments
        const [completedAppointmentsRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments 
             WHERE doctor_id = ? AND status = 'completed'`,
            [doctorId]
        );
        
        // Appointments by status
        const [appointmentsByStatusRows] = await connection.execute(
            `SELECT status, COUNT(*) as count 
             FROM appointments 
             WHERE doctor_id = ? 
             GROUP BY status`,
            [doctorId]
        );
        
        // Recent appointments (last 7 days)
        const [recentAppointmentsRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments 
             WHERE doctor_id = ? AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
            [doctorId]
        );
        
        return {
            totalPatients: totalPatientsRows[0].total,
            todayAppointments: todayAppointmentsRows[0].total,
            upcomingAppointments: upcomingAppointmentsRows[0].total,
            completedAppointments: completedAppointmentsRows[0].total,
            recentAppointments: recentAppointmentsRows[0].total,
            appointmentsByStatus: appointmentsByStatusRows
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createDoctor,
    getDoctorByUserId,
    getDoctorById,
    updateDoctor,
    getAllDoctors,
    searchDoctors,
    getDoctorAppointments,
    getDoctorPatients,
    getDoctorStats
};
