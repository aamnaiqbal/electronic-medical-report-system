const { 
    getDoctorByUserId, 
    updateDoctor, 
    getDoctorAppointments, 
    getDoctorPatients, 
    getDoctorStats,
    getDoctorById,
    getAllDoctors,
    searchDoctors
} = require('../models/doctorModel');
const { getConnection } = require('../config/database');
const { 
    successResponse, 
    errorResponse, 
    notFoundResponse, 
    unauthorizedResponse 
} = require('../utils/responseHandler');

/**
 * Doctor Controller
 * Handles doctor-specific operations and public doctor listings
 */

/**
 * Get doctor profile (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorProfile = async (req, res) => {
    try {
        console.log('=== GET DOCTOR PROFILE DEBUG ===');
        console.log('Request headers:', req.headers);
        console.log('Request user:', req.user);
        console.log('Request authentication status:', !!req.user);
        
        if (!req.user) {
            console.log('ERROR: No user object in request - authentication failed');
            return errorResponse(res, 401, 'Authentication required');
        }
        
        if (!req.user.id) {
            console.log('ERROR: No user ID in request.user:', req.user);
            return errorResponse(res, 400, 'Invalid user data');
        }
        
        const userId = req.user.id;
        console.log('Fetching doctor for userId:', userId);
        
        const doctor = await getDoctorByUserId(userId);
        console.log('Doctor query result:', doctor);
        
        if (!doctor) {
            console.log('ERROR: Doctor profile not found for userId:', userId);
            return notFoundResponse(res, 'Doctor profile not found');
        }
        
        console.log('SUCCESS: Doctor profile found, returning data');
        console.log('Doctor data being returned:', JSON.stringify(doctor, null, 2));
        return successResponse(
            res,
            200,
            'Doctor profile retrieved successfully',
            { doctor }
        );
        
    } catch (error) {
        console.error('Get doctor profile error:', error);
        console.error('Error stack:', error.stack);
        return errorResponse(res, 500, 'Failed to retrieve doctor profile');
    }
};

/**
 * Update doctor profile (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const doctorData = req.validatedData.body;
        
        const success = await updateDoctor(userId, doctorData);
        if (!success) {
            return errorResponse(res, 500, 'Failed to update doctor profile');
        }
        
        // Get updated doctor data
        const updatedDoctor = await getDoctorByUserId(userId);
        
        return successResponse(
            res,
            200,
            'Doctor profile updated successfully',
            { doctor: updatedDoctor }
        );
        
    } catch (error) {
        console.error('Update doctor profile error:', error);
        return errorResponse(res, 500, 'Failed to update doctor profile');
    }
};

/**
 * Get doctor's appointments (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorAppointmentsController = async (req, res) => {
    try {
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            status: req.query.status,
            date: req.query.date,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await getDoctorAppointments(doctorId, options);
        
        return successResponse(
            res,
            200,
            'Appointments retrieved successfully',
            result.appointments,
            {
                pagination: result.pagination,
                filters: {
                    status: req.query.status,
                    date: req.query.date,
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                },
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        return errorResponse(res, 500, 'Failed to retrieve appointments');
    }
};

/**
 * Get specific appointment (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppointmentById = async (req, res) => {
    try {
        const appointmentId = req.validatedData.params.id;
        
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const connection = await getConnection();
        
        const [rows] = await connection.execute(
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
             WHERE a.id = ? AND a.doctor_id = ?`,
            [appointmentId, doctorId]
        );
        
        if (rows.length === 0) {
            return notFoundResponse(res, 'Appointment not found');
        }
        
        return successResponse(
            res,
            200,
            'Appointment retrieved successfully',
            { appointment: rows[0] }
        );
        
    } catch (error) {
        console.error('Get appointment by ID error:', error);
        return errorResponse(res, 500, 'Failed to retrieve appointment');
    }
};

/**
 * Update appointment status (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        console.log('=== UPDATE APPOINTMENT STATUS DEBUG ===');
        console.log('req.user:', req.user);
        console.log('req.user.doctorData:', req.user.doctorData);
        console.log('req.validatedData:', req.validatedData);
        console.log('req.params:', req.params);
        console.log('req.body:', req.body);
        
        const appointmentId = req.validatedData?.params?.id || req.params.id;
        const { status, notes } = req.validatedData?.body || req.body;
        
        console.log('appointmentId:', appointmentId);
        console.log('status:', status);
        console.log('notes:', notes);
        
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        console.log('Extracted doctorId:', doctorId);
        
        if (!doctorId) {
            console.log('ERROR: Doctor ID not found in req.user.doctorData');
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const connection = await getConnection();
        
        // Check if appointment exists and belongs to doctor
        const [existingAppointment] = await connection.execute(
            'SELECT id, status FROM appointments WHERE id = ? AND doctor_id = ?',
            [appointmentId, doctorId]
        );
        
        if (existingAppointment.length === 0) {
            return notFoundResponse(res, 'Appointment not found');
        }
        
        // Update appointment status
        const updateFields = ['status = ?'];
        const updateValues = [status];
        
        if (notes !== undefined) {
            updateFields.push('notes = ?');
            updateValues.push(notes);
        }
        
        updateValues.push(appointmentId);
        
        const [result] = await connection.execute(
            `UPDATE appointments SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            updateValues
        );
        
        if (result.affectedRows === 0) {
            return errorResponse(res, 500, 'Failed to update appointment status');
        }
        
        // Get updated appointment
        const [updatedAppointment] = await connection.execute(
            `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    u.id as patient_user_id, u.email as patient_email,
                    pr.first_name as patient_first_name, pr.last_name as patient_last_name, 
                    pr.phone as patient_phone, pr.gender as patient_gender
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             WHERE a.id = ?`,
            [appointmentId]
        );
        
        return successResponse(
            res,
            200,
            'Appointment status updated successfully',
            { appointment: updatedAppointment[0] }
        );
        
    } catch (error) {
        console.error('Update appointment status error:', error);
        return errorResponse(res, 500, 'Failed to update appointment status');
    }
};

/**
 * Get doctor's patients (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorPatientsController = async (req, res) => {
    try {
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            search: req.search.query,
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await getDoctorPatients(doctorId, options);
        
        return successResponse(
            res,
            200,
            'Patients retrieved successfully',
            result.patients,
            {
                pagination: result.pagination,
                search: req.search,
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get doctor patients error:', error);
        return errorResponse(res, 500, 'Failed to retrieve patients');
    }
};

/**
 * Get patient by ID (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientByIdController = async (req, res) => {
    try {
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const patientId = parseInt(req.params.id);
        
        if (isNaN(patientId)) {
            return errorResponse(res, 400, 'Invalid patient ID');
        }
        
        // Get patient details - verify they have an appointment with this doctor
        const connection = await getConnection();
        const [rows] = await connection.execute(
            `SELECT DISTINCT p.id as patient_id, p.blood_group, p.allergies, p.emergency_contact,
                    u.id as patient_user_id, u.email as patient_email, u.created_at as patient_created_at,
                    pr.first_name as patient_first_name, pr.last_name as patient_last_name, 
                    pr.phone as patient_phone, pr.gender as patient_gender, 
                    pr.date_of_birth as patient_date_of_birth, pr.address as patient_address,
                    COUNT(a.id) as appointment_count,
                    MAX(a.appointment_date) as last_appointment_date
             FROM patients p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             LEFT JOIN appointments a ON p.id = a.patient_id AND a.doctor_id = ?
             WHERE p.id = ?
             GROUP BY p.id, u.id, pr.id`,
            [doctorId, patientId]
        );
        
        if (rows.length === 0) {
            return notFoundResponse(res, 'Patient not found or not associated with this doctor');
        }
        
        return successResponse(
            res,
            200,
            'Patient retrieved successfully',
            { patient: rows[0] }
        );
        
    } catch (error) {
        console.error('Get patient by ID error:', error);
        return errorResponse(res, 500, 'Failed to retrieve patient');
    }
};

/**
 * Create medical record (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMedicalRecordController = async (req, res) => {
    try {
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const { appointmentId, diagnosis, symptoms, prescriptions } = req.body;
        
        // Validate required fields
        if (!appointmentId || !diagnosis) {
            return errorResponse(res, 400, 'Appointment ID and diagnosis are required');
        }
        
        if (!prescriptions || prescriptions.length === 0) {
            return errorResponse(res, 400, 'At least one prescription is required');
        }
        
        const connection = await getConnection();
        
        // Verify the appointment exists and belongs to this doctor
        const [appointmentRows] = await connection.execute(
            'SELECT id, patient_id, status FROM appointments WHERE id = ? AND doctor_id = ?',
            [appointmentId, doctorId]
        );
        
        if (appointmentRows.length === 0) {
            return notFoundResponse(res, 'Appointment not found or not associated with this doctor');
        }
        
        const appointment = appointmentRows[0];
        
        // Create medical record
        const [medicalRecordResult] = await connection.execute(
            `INSERT INTO medical_records (appointment_id, doctor_id, patient_id, diagnosis, symptoms, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [appointmentId, doctorId, appointment.patient_id, diagnosis, symptoms || null]
        );
        
        const medicalRecordId = medicalRecordResult.insertId;
        
        // Insert prescriptions
        for (const prescription of prescriptions) {
            await connection.execute(
                `INSERT INTO prescriptions (medical_record_id, medication_name, dosage, frequency, duration, instructions, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [
                    medicalRecordId,
                    prescription.medicationName,
                    prescription.dosage,
                    prescription.frequency,
                    prescription.duration,
                    prescription.instructions || null
                ]
            );
        }
        
        // Get the complete medical record with prescriptions
        const [recordRows] = await connection.execute(
            `SELECT mr.*, 
                    a.appointment_date, a.appointment_time,
                    p.first_name as patient_first_name, p.last_name as patient_last_name
             FROM medical_records mr
             LEFT JOIN appointments a ON mr.appointment_id = a.id
             LEFT JOIN patients pat ON mr.patient_id = pat.id
             LEFT JOIN users u ON pat.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE mr.id = ?`,
            [medicalRecordId]
        );
        
        const [prescriptionRows] = await connection.execute(
            'SELECT * FROM prescriptions WHERE medical_record_id = ?',
            [medicalRecordId]
        );
        
        const medicalRecord = {
            ...recordRows[0],
            prescriptions: prescriptionRows
        };
        
        return successResponse(
            res,
            201,
            'Medical record created successfully',
            { medicalRecord }
        );
        
    } catch (error) {
        console.error('Create medical record error:', error);
        return errorResponse(res, 500, 'Failed to create medical record');
    }
};

/**
 * Get patient medical records (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientMedicalRecordsController = async (req, res) => {
    try {
        const doctorId = req.user.doctorData?.id;
        const { patientId } = req.params;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        if (!patientId) {
            return errorResponse(res, 400, 'Patient ID is required');
        }
        
        const connection = await getConnection();
        
        // Get all medical records for this patient
        const [records] = await connection.execute(
            `SELECT 
                mr.id,
                mr.diagnosis,
                mr.symptoms,
                mr.created_at,
                a.appointment_date,
                a.appointment_time,
                d.specialization,
                p.first_name as doctor_first_name,
                p.last_name as doctor_last_name
             FROM medical_records mr
             LEFT JOIN appointments a ON mr.appointment_id = a.id
             LEFT JOIN doctors d ON mr.doctor_id = d.id
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE mr.patient_id = ?
             ORDER BY mr.created_at DESC`,
            [patientId]
        );
        
        // Get prescriptions for each medical record
        for (let record of records) {
            const [prescriptions] = await connection.execute(
                `SELECT 
                    medication_name,
                    dosage,
                    frequency,
                    duration,
                    instructions
                 FROM prescriptions
                 WHERE medical_record_id = ?`,
                [record.id]
            );
            record.prescriptions = prescriptions;
        }
        
        return successResponse(
            res,
            200,
            'Medical records retrieved successfully',
            { medicalRecords: records }
        );
        
    } catch (error) {
        console.error('Get patient medical records error:', error);
        return errorResponse(res, 500, 'Failed to retrieve medical records');
    }
};

/**
 * Get doctor statistics (authenticated doctor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorStatsController = async (req, res) => {
    try {
        // Get doctor ID from the authenticated user's doctor data
        const doctorId = req.user.doctorData?.id;
        
        if (!doctorId) {
            return errorResponse(res, 404, 'Doctor profile not found');
        }
        
        const stats = await getDoctorStats(doctorId);
        
        return successResponse(
            res,
            200,
            'Doctor statistics retrieved successfully',
            stats
        );
        
    } catch (error) {
        console.error('Get doctor stats error:', error);
        return errorResponse(res, 500, 'Failed to retrieve doctor statistics');
    }
};

/**
 * Get all doctors (public endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDoctorsController = async (req, res) => {
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
 * Get doctor by ID (public endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorByIdController = async (req, res) => {
    try {
        const doctorId = req.validatedData.params.id;
        
        const doctor = await getDoctorById(doctorId);
        if (!doctor) {
            return notFoundResponse(res, 'Doctor not found');
        }
        
        return successResponse(
            res,
            200,
            'Doctor retrieved successfully',
            { doctor }
        );
        
    } catch (error) {
        console.error('Get doctor by ID error:', error);
        return errorResponse(res, 500, 'Failed to retrieve doctor');
    }
};

/**
 * Search doctors (public endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchDoctorsController = async (req, res) => {
    try {
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            search: req.query.search,
            filters: {
                specialization: req.query.specialization,
                experienceMin: req.query.experienceMin,
                experienceMax: req.query.experienceMax,
                feeMin: req.query.feeMin,
                feeMax: req.query.feeMax
            },
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await searchDoctors(options);
        
        return successResponse(
            res,
            200,
            'Search results retrieved successfully',
            result.doctors,
            {
                pagination: result.pagination,
                search: req.query.search,
                filters: options.filters,
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Search doctors error:', error);
        return errorResponse(res, 500, 'Failed to search doctors');
    }
};

module.exports = {
    getDoctorProfile,
    updateDoctorProfile,
    getDoctorAppointmentsController,
    getAppointmentById,
    updateAppointmentStatus,
    getDoctorPatientsController,
    getPatientByIdController,
    createMedicalRecordController,
    getPatientMedicalRecordsController,
    getDoctorStatsController,
    getAllDoctorsController,
    getDoctorByIdController,
    searchDoctorsController
};
