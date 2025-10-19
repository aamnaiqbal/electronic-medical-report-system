const { 
    getPatientByUserId, 
    updatePatient, 
    getPatientStats 
} = require('../models/patientModel');
const { 
    createAppointment, 
    getAppointmentById, 
    getAppointmentsByPatient, 
    cancelAppointment 
} = require('../models/appointmentModel');
const { getAllDoctors } = require('../models/doctorModel');
const { 
    checkSlotAvailability, 
    calculateAvailableSlots, 
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    canCancelAppointment
} = require('../services/appointmentService');
const { getConnection } = require('../config/database');
const { 
    successResponse, 
    errorResponse, 
    notFoundResponse, 
    unauthorizedResponse,
    conflictResponse
} = require('../utils/responseHandler');

/**
 * Patient Controller
 * Handles patient-specific operations and appointment booking
 */

/**
 * Get patient profile (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientProfile = async (req, res) => {
    try {
        console.log('=== GET PATIENT PROFILE DEBUG ===');
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
        console.log('Fetching patient for userId:', userId);
        
        const patient = await getPatientByUserId(userId);
        console.log('Patient query result:', patient);
        
        if (!patient) {
            console.log('ERROR: Patient profile not found for userId:', userId);
            return notFoundResponse(res, 'Patient profile not found');
        }
        
        console.log('SUCCESS: Patient profile found, returning data');
        console.log('Patient data being returned:', JSON.stringify(patient, null, 2));
        return successResponse(
            res,
            200,
            'Patient profile retrieved successfully',
            { patient }
        );
        
    } catch (error) {
        console.error('Get patient profile error:', error);
        console.error('Error stack:', error.stack);
        return errorResponse(res, 500, 'Failed to retrieve patient profile');
    }
};

/**
 * Update patient profile (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const patientData = req.validatedData.body;
        
        const success = await updatePatient(userId, patientData);
        if (!success) {
            return errorResponse(res, 500, 'Failed to update patient profile');
        }
        
        // Get updated patient data
        const updatedPatient = await getPatientByUserId(userId);
        
        return successResponse(
            res,
            200,
            'Patient profile updated successfully',
            { patient: updatedPatient }
        );
        
    } catch (error) {
        console.error('Update patient profile error:', error);
        return errorResponse(res, 500, 'Failed to update patient profile');
    }
};

/**
 * Book appointment (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bookAppointment = async (req, res) => {
    try {
        // Get patient ID from the authenticated user's patient data
        const patientId = req.user.patientData?.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const { doctorId, appointmentDate, appointmentTime, reason, notes } = req.validatedData.body;
        
        // Check slot availability
        const availability = await checkSlotAvailability(doctorId, appointmentDate, appointmentTime);
        if (!availability.available) {
            return conflictResponse(res, availability.reason);
        }
        
        // Get patient details
        const patient = await getPatientByUserId(req.user.id);
        if (!patient) {
            return notFoundResponse(res, 'Patient profile not found');
        }
        
        // Get doctor details
        const connection = await getConnection();
        const [doctorRows] = await connection.execute(
            `SELECT d.id, d.specialization, d.consultation_fee,
                    du.email as doctor_email,
                    dp.first_name as doctor_first_name, dp.last_name as doctor_last_name
             FROM doctors d
             LEFT JOIN users du ON d.user_id = du.id
             LEFT JOIN profiles dp ON du.id = dp.user_id
             WHERE d.id = ?`,
            [doctorId]
        );
        
        if (doctorRows.length === 0) {
            return notFoundResponse(res, 'Doctor not found');
        }
        
        const doctor = doctorRows[0];
        
        // Create appointment
        const appointmentData = {
            patientId: patient.id,
            doctorId: doctorId,
            appointmentDate,
            appointmentTime,
            status: 'pending',
            reason,
            notes
        };
        
        const newAppointment = await createAppointment(appointmentData);
        
        // Send confirmation (placeholder)
        await sendAppointmentConfirmation(
            { ...newAppointment, appointment_date: appointmentDate, appointment_time: appointmentTime },
            patient,
            doctor
        );
        
        // Get full appointment details
        const fullAppointment = await getAppointmentById(newAppointment.id);
        
        return successResponse(
            res,
            201,
            'Appointment booked successfully',
            { appointment: fullAppointment }
        );
        
    } catch (error) {
        console.error('Book appointment error:', error);
        return errorResponse(res, 500, 'Failed to book appointment');
    }
};

/**
 * Get patient's appointments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientAppointments = async (req, res) => {
    try {
        // Get patient ID from the authenticated user's patient data
        const patientId = req.user.patientData?.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const options = {
            page: req.pagination.page,
            limit: req.pagination.limit,
            status: req.query.status,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            sortBy: req.sort.by,
            sortOrder: req.sort.order
        };
        
        const result = await getAppointmentsByPatient(patientId, options);
        
        return successResponse(
            res,
            200,
            'Appointments retrieved successfully',
            result.appointments,
            {
                pagination: result.pagination,
                filters: {
                    status: req.query.status,
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                },
                sort: req.sort
            }
        );
        
    } catch (error) {
        console.error('Get patient appointments error:', error);
        return errorResponse(res, 500, 'Failed to retrieve appointments');
    }
};

/**
 * Get specific appointment (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientAppointmentById = async (req, res) => {
    try {
        const appointmentId = req.validatedData.params.id;
        
        // Get patient ID from the authenticated user's patient data
        const patientId = req.user.patientData?.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const connection = await getConnection();
        
        // Get appointment and verify it belongs to the patient
        const [rows] = await connection.execute(
            `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, 
                    a.created_at, a.updated_at,
                    p.id as patient_id,
                    d.id as doctor_id, d.specialization, d.license_number, d.qualification, 
                    d.experience_years, d.consultation_fee,
                    du.email as doctor_email,
                    dp.first_name as doctor_first_name, dp.last_name as doctor_last_name, 
                    dp.phone as doctor_phone, dp.gender as doctor_gender
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             LEFT JOIN users du ON d.user_id = du.id
             LEFT JOIN profiles dp ON du.id = dp.user_id
             WHERE a.id = ? AND a.patient_id = ?`,
            [appointmentId, patientId]
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
 * Cancel appointment (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelPatientAppointment = async (req, res) => {
    try {
        const appointmentId = req.validatedData.params.id;
        
        // Get patient ID from the authenticated user's patient data
        const patientId = req.user.patientData?.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const { reason } = req.validatedData.body;
        
        const connection = await getConnection();
        
        // Get appointment and verify it belongs to the patient
        const [appointmentRows] = await connection.execute(
            `SELECT a.*, p.user_id as patient_user_id
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             WHERE a.id = ? AND a.patient_id = ?`,
            [appointmentId, patientId]
        );
        
        if (appointmentRows.length === 0) {
            return notFoundResponse(res, 'Appointment not found');
        }
        
        const appointment = appointmentRows[0];
        
        // Check if appointment can be cancelled
        const canCancel = canCancelAppointment(appointment);
        if (!canCancel.canCancel) {
            return conflictResponse(res, canCancel.reason);
        }
        
        // Cancel appointment
        const success = await cancelAppointment(appointmentId, reason);
        if (!success) {
            return errorResponse(res, 500, 'Failed to cancel appointment');
        }
        
        // Get patient and doctor details for notification
        const patient = await getPatientByUserId(patientId);
        
        const [doctorRows] = await connection.execute(
            `SELECT d.id, d.specialization,
                    du.email as doctor_email,
                    dp.first_name as doctor_first_name, dp.last_name as doctor_last_name
             FROM doctors d
             LEFT JOIN users du ON d.user_id = du.id
             LEFT JOIN profiles dp ON du.id = dp.user_id
             WHERE d.id = ?`,
            [appointment.doctor_id]
        );
        
        const doctor = doctorRows[0];
        
        // Send cancellation notification
        await sendAppointmentCancellation(appointment, patient, doctor, reason);
        
        return successResponse(res, 200, 'Appointment cancelled successfully');
        
    } catch (error) {
        console.error('Cancel appointment error:', error);
        return errorResponse(res, 500, 'Failed to cancel appointment');
    }
};

/**
 * Get available doctors (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAvailableDoctors = async (req, res) => {
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
        console.error('Get available doctors error:', error);
        return errorResponse(res, 500, 'Failed to retrieve doctors');
    }
};

/**
 * Get doctor availability (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorAvailability = async (req, res) => {
    try {
        console.log('=== GET DOCTOR AVAILABILITY DEBUG ===');
        console.log('Request params:', req.params);
        console.log('Request query:', req.query);
        console.log('Request validatedData:', req.validatedData);
        
        // Safely extract data with fallbacks
        const doctorId = req.validatedData?.params?.id || req.params?.id;
        const date = req.validatedData?.query?.date || req.query?.date;
        
        console.log('Extracted doctorId:', doctorId);
        console.log('Extracted date:', date);
        
        if (!doctorId) {
            console.error('ERROR: Doctor ID is missing');
            return errorResponse(res, 400, 'Doctor ID is required');
        }
        
        if (!date) {
            console.error('ERROR: Date is missing');
            return errorResponse(res, 400, 'Date is required');
        }
        
        const result = await calculateAvailableSlots(doctorId, date);
        
        if (!result.available) {
            return errorResponse(res, 400, result.reason);
        }
        
        return successResponse(
            res,
            200,
            'Doctor availability retrieved successfully',
            result
        );
        
    } catch (error) {
        console.error('Get doctor availability error:', error);
        console.error('Error stack:', error.stack);
        return errorResponse(res, 500, 'Failed to retrieve doctor availability');
    }
};

/**
 * Get patient statistics (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientStatsController = async (req, res) => {
    try {
        // Get patient ID from the authenticated user's patient data
        const patientId = req.user.patientData?.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const stats = await getPatientStats(patientId);
        
        return successResponse(
            res,
            200,
            'Patient statistics retrieved successfully',
            stats
        );
        
    } catch (error) {
        console.error('Get patient stats error:', error);
        return errorResponse(res, 500, 'Failed to retrieve patient statistics');
    }
};

/**
 * Get patient's medical records (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientMedicalRecords = async (req, res) => {
    try {
        const patientId = req.user.patientData?.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const connection = await getConnection();
        
        // Get medical records with doctor info and prescriptions
        const [records] = await connection.execute(
            `SELECT 
                mr.id, 
                mr.diagnosis, 
                mr.symptoms, 
                mr.created_at as createdAt,
                mr.appointment_id as appointmentId,
                CONCAT(p.first_name, ' ', p.last_name) as doctorName,
                d.specialization,
                a.appointment_date as appointmentDate,
                a.appointment_time as appointmentTime
             FROM medical_records mr
             LEFT JOIN doctors d ON mr.doctor_id = d.id
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             LEFT JOIN appointments a ON mr.appointment_id = a.id
             WHERE mr.patient_id = ?
             ORDER BY mr.created_at DESC`,
            [patientId]
        );
        
        // Get prescriptions for each record
        for (let record of records) {
            const [prescriptions] = await connection.execute(
                `SELECT 
                    id,
                    medication_name as medicationName,
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
            records
        );
        
    } catch (error) {
        console.error('Get patient medical records error:', error);
        return errorResponse(res, 500, 'Failed to retrieve medical records');
    }
};

/**
 * Get specific medical record by ID (authenticated patient)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPatientMedicalRecordById = async (req, res) => {
    try {
        const patientId = req.user.patientData?.id;
        const recordId = req.params.id;
        
        if (!patientId) {
            return errorResponse(res, 404, 'Patient profile not found');
        }
        
        const connection = await getConnection();
        
        // Get medical record with doctor info
        const [records] = await connection.execute(
            `SELECT 
                mr.id, 
                mr.diagnosis, 
                mr.symptoms, 
                mr.created_at as createdAt,
                mr.appointment_id as appointmentId,
                CONCAT(p.first_name, ' ', p.last_name) as doctorName,
                d.specialization,
                p.phone as doctorPhone,
                a.appointment_date as appointmentDate,
                a.appointment_time as appointmentTime
             FROM medical_records mr
             LEFT JOIN doctors d ON mr.doctor_id = d.id
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             LEFT JOIN appointments a ON mr.appointment_id = a.id
             WHERE mr.id = ? AND mr.patient_id = ?`,
            [recordId, patientId]
        );
        
        if (records.length === 0) {
            return notFoundResponse(res, 'Medical record not found');
        }
        
        const record = records[0];
        
        // Get prescriptions
        const [prescriptions] = await connection.execute(
            `SELECT 
                id,
                medication_name as medicationName,
                dosage,
                frequency,
                duration,
                instructions
             FROM prescriptions
             WHERE medical_record_id = ?`,
            [recordId]
        );
        
        record.prescriptions = prescriptions;
        
        return successResponse(
            res,
            200,
            'Medical record retrieved successfully',
            { medicalRecord: record }
        );
        
    } catch (error) {
        console.error('Get patient medical record by ID error:', error);
        return errorResponse(res, 500, 'Failed to retrieve medical record');
    }
};

module.exports = {
    getPatientProfile,
    updatePatientProfile,
    bookAppointment,
    getPatientAppointments,
    getPatientAppointmentById,
    cancelPatientAppointment,
    getAvailableDoctors,
    getDoctorAvailability,
    getPatientStats: getPatientStatsController,
    getPatientMedicalRecords,
    getPatientMedicalRecordById
};
