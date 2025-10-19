const { getConnection } = require('../config/database');

/**
 * Appointment Model - Database operations for appointments
 */

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment
 */
const createAppointment = async (appointmentData) => {
    const connection = await getConnection();
    
    try {
        const [result] = await connection.execute(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                appointmentData.patientId,
                appointmentData.doctorId,
                appointmentData.appointmentDate,
                appointmentData.appointmentTime,
                appointmentData.status || 'pending',
                appointmentData.reason || null,
                appointmentData.notes || null
            ]
        );
        
        return {
            id: result.insertId,
            ...appointmentData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get appointment by ID with full details
 * @param {number} appointmentId - Appointment ID
 * @returns {Promise<Object|null>} Appointment with doctor and patient details
 */
const getAppointmentById = async (appointmentId) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    pu.id as patient_user_id, pu.email as patient_email, pu.created_at as patient_created_at,
                    pp.first_name as patient_first_name, pp.last_name as patient_last_name, 
                    pp.phone as patient_phone, pp.gender as patient_gender, 
                    pp.date_of_birth as patient_date_of_birth, pp.address as patient_address,
                    d.id as doctor_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee,
                    du.id as doctor_user_id, du.email as doctor_email, du.created_at as doctor_created_at,
                    dp.first_name as doctor_first_name, dp.last_name as doctor_last_name, 
                    dp.phone as doctor_phone, dp.gender as doctor_gender, 
                    dp.date_of_birth as doctor_date_of_birth, dp.address as doctor_address
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users pu ON p.user_id = pu.id
             LEFT JOIN profiles pp ON pu.id = pp.user_id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             LEFT JOIN users du ON d.user_id = du.id
             LEFT JOIN profiles dp ON du.id = dp.user_id
             WHERE a.id = ?`,
            [appointmentId]
        );
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Get appointments by patient ID
 * @param {number} patientId - Patient ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Appointments with pagination info
 */
/**
 * Get appointments by patient ID
 * @param {number} patientId - Patient ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Appointments with pagination info
 */
const getAppointmentsByPatient = async (patientId, options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 20,
            status = null,
            dateFrom = null,
            dateTo = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;
        
        const limitNum = Number(limit) || 20;
        const offset = (Number(page) - 1) * limitNum;
        
        // Build WHERE clause
        let whereConditions = ['a.patient_id = ?'];
        let queryParams = [patientId];
        
        // Status filter
        if (status) {
            whereConditions.push('a.status = ?');
            queryParams.push(status);
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
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total 
             FROM appointments a
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get appointments with doctor details
        const sql = `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    d.id as doctor_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee,
                    du.email as doctor_email,
                    dp.first_name as doctor_first_name, dp.last_name as doctor_last_name, 
                    dp.phone as doctor_phone, dp.gender as doctor_gender
             FROM appointments a
             LEFT JOIN doctors d ON a.doctor_id = d.id
             LEFT JOIN users du ON d.user_id = du.id
             LEFT JOIN profiles dp ON du.id = dp.user_id
             ${whereClause}
             ORDER BY a.${sortBy} ${sortOrder}
             LIMIT ${limitNum} OFFSET ${offset}`;
        
        const [rows] = await connection.query(sql, queryParams);
        
        return {
            appointments: rows,
            pagination: {
                page: Number(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        console.error('Get patient appointments error:', error);
        throw error;
    }
};

/**
 * Get appointments by doctor ID
 * @param {number} doctorId - Doctor ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Appointments with pagination info
 */
const getAppointmentsByDoctor = async (doctorId, options = {}) => {
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
        const [rows] = await connection.execute(
            `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    pu.email as patient_email,
                    pp.first_name as patient_first_name, pp.last_name as patient_last_name, 
                    pp.phone as patient_phone, pp.gender as patient_gender, 
                    pp.date_of_birth as patient_date_of_birth, pp.address as patient_address
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users pu ON p.user_id = pu.id
             LEFT JOIN profiles pp ON pu.id = pp.user_id
             ${whereClause}
             ORDER BY a.${sortBy} ${sortOrder}
             LIMIT ? OFFSET ?`,
            [...queryParams, limitNum, offset]
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
 * Update appointment status
 * @param {number} appointmentId - Appointment ID
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Promise<boolean>} Success status
 */
const updateAppointmentStatus = async (appointmentId, status, notes = null) => {
    const connection = await getConnection();
    
    try {
        const fields = ['status = ?'];
        const values = [status];
        
        if (notes !== null) {
            fields.push('notes = ?');
            values.push(notes);
        }
        
        values.push(appointmentId);
        
        const [result] = await connection.execute(
            `UPDATE appointments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Cancel appointment
 * @param {number} appointmentId - Appointment ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<boolean>} Success status
 */
const cancelAppointment = async (appointmentId, reason = null) => {
    return updateAppointmentStatus(appointmentId, 'cancelled', reason);
};

/**
 * Check doctor availability for a specific time slot
 * @param {number} doctorId - Doctor ID
 * @param {string} date - Appointment date (YYYY-MM-DD)
 * @param {string} time - Appointment time (HH:MM:SS)
 * @returns {Promise<boolean>} True if available
 */
const checkDoctorAvailability = async (doctorId, date, time) => {
    const connection = await getConnection();
    
    try {
        const [rows] = await connection.execute(
            `SELECT id FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
             AND status IN ('pending', 'confirmed')`,
            [doctorId, date, time]
        );
        
        return rows.length === 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Get appointments by date range
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Appointments with pagination info
 */
const getAppointmentsByDateRange = async (options = {}) => {
    const connection = await getConnection();
    
    try {
        const {
            page = 1,
            limit = 10,
            dateFrom,
            dateTo,
            doctorId = null,
            patientId = null,
            status = null,
            sortBy = 'appointment_date',
            sortOrder = 'ASC'
        } = options;
        
        const pageNum = parseInt(page, 10) || 1; const limitNum = parseInt(limit, 10) || 10; const offset = (pageNum - 1) * limitNum;
        
        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];
        
        // Date range filters
        if (dateFrom) {
            whereConditions.push('a.appointment_date >= ?');
            queryParams.push(dateFrom);
        }
        
        if (dateTo) {
            whereConditions.push('a.appointment_date <= ?');
            queryParams.push(dateTo);
        }
        
        // Doctor filter
        if (doctorId) {
            whereConditions.push('a.doctor_id = ?');
            queryParams.push(doctorId);
        }
        
        // Patient filter
        if (patientId) {
            whereConditions.push('a.patient_id = ?');
            queryParams.push(patientId);
        }
        
        // Status filter
        if (status) {
            whereConditions.push('a.status = ?');
            queryParams.push(status);
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        // Get total count
        const [countRows] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM appointments a
             ${whereClause}`,
            queryParams
        );
        const total = countRows[0].total;
        
        // Get appointments with full details
        const [rows] = await connection.query(
            `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    pu.email as patient_email,
                    pp.first_name as patient_first_name, pp.last_name as patient_last_name, 
                    pp.phone as patient_phone, pp.gender as patient_gender,
                    d.id as doctor_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee,
                    du.email as doctor_email,
                    dp.first_name as doctor_first_name, dp.last_name as doctor_last_name, 
                    dp.phone as doctor_phone, dp.gender as doctor_gender
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users pu ON p.user_id = pu.id
             LEFT JOIN profiles pp ON pu.id = pp.user_id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             LEFT JOIN users du ON d.user_id = du.id
             LEFT JOIN profiles dp ON du.id = dp.user_id
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
 * Get available time slots for a doctor on a specific date
 * @param {number} doctorId - Doctor ID
 * @param {string} date - Appointment date (YYYY-MM-DD)
 * @returns {Promise<Array>} Available time slots
 */
const getAvailableTimeSlots = async (doctorId, date) => {
    const connection = await getConnection();
    
    try {
        // Get doctor's working hours (assuming 9 AM to 5 PM for now)
        const workingHours = [
            '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
            '12:00:00', '12:30:00', '13:00:00', '13:30:00', '14:00:00', '14:30:00',
            '15:00:00', '15:30:00', '16:00:00', '16:30:00', '17:00:00'
        ];
        
        // Get booked time slots
        const [bookedSlots] = await connection.execute(
            `SELECT appointment_time FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? 
             AND status IN ('pending', 'confirmed')`,
            [doctorId, date]
        );
        
        const bookedTimes = bookedSlots.map(slot => slot.appointment_time);
        
        // Filter out booked slots
        const availableSlots = workingHours.filter(time => !bookedTimes.includes(time));
        
        return availableSlots;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createAppointment,
    getAppointmentById,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    updateAppointmentStatus,
    cancelAppointment,
    checkDoctorAvailability,
    getAppointmentsByDateRange,
    getAvailableTimeSlots
};
