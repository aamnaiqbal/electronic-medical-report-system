const express = require('express');
const { 
    getPatientProfile,
    updatePatientProfile,
    bookAppointment,
    getPatientAppointments,
    getPatientAppointmentById,
    cancelPatientAppointment,
    getAvailableDoctors,
    getDoctorAvailability,
    getPatientStats,
    getPatientMedicalRecords,
    getPatientMedicalRecordById
} = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../middleware/pagination');
const { 
    validate, 
    bookAppointmentSchema,
    getAppointmentsQuerySchema,
    getAppointmentByIdSchema,
    cancelAppointmentParamsSchema,
    cancelAppointmentSchema,
    getDoctorAvailabilityQuerySchema,
    getDoctorAvailabilitySchema,
    getDoctorByIdParamsSchema,
    searchDoctorsQuerySchema,
    updatePatientProfileSchema
} = require('../validators/appointmentValidator');

const router = express.Router();

/**
 * Patient Routes
 * All routes are prefixed with /api/patients and require patient authentication
 */

/**
 * @route   GET /api/patients/profile
 * @desc    Get patient profile (authenticated patient)
 * @access  Private (Patient only)
 */
router.get('/profile', authenticateToken, getPatientProfile);

/**
 * @route   PUT /api/patients/profile
 * @desc    Update patient profile (authenticated patient)
 * @access  Private (Patient only)
 */
router.put('/profile', 
    authenticateToken, 
    validate(updatePatientProfileSchema), 
    updatePatientProfile
);

/**
 * @route   POST /api/patients/appointments
 * @desc    Book new appointment (authenticated patient)
 * @access  Private (Patient only)
 */
router.post('/appointments', 
    authenticateToken, 
    validate(bookAppointmentSchema), 
    bookAppointment
);

/**
 * @route   GET /api/patients/appointments
 * @desc    Get patient's appointments with filters and pagination
 * @access  Private (Patient only)
 */
router.get('/appointments', 
    authenticateToken, 
    query, 
    validate(getAppointmentsQuerySchema), 
    getPatientAppointments
);

/**
 * @route   GET /api/patients/appointments/:id
 * @desc    Get specific appointment (authenticated patient)
 * @access  Private (Patient only)
 */
router.get('/appointments/:id', 
    authenticateToken, 
    validate(getAppointmentByIdSchema),
    getPatientAppointmentById
);

/**
 * @route   PUT /api/patients/appointments/:id/cancel
 * @desc    Cancel appointment (authenticated patient)
 * @access  Private (Patient only)
 */
router.put('/appointments/:id/cancel', 
    authenticateToken, 
    validate(cancelAppointmentParamsSchema),
    validate(cancelAppointmentSchema),
    cancelPatientAppointment
);

/**
 * @route   GET /api/patients/doctors
 * @desc    Get available doctors for booking
 * @access  Private (Patient only)
 */
router.get('/doctors', 
    authenticateToken, 
    query, 
    validate(searchDoctorsQuerySchema), 
    getAvailableDoctors
);

/**
 * @route   GET /api/patients/doctors/:id/availability
 * @desc    Get doctor's available time slots for a specific date
 * @access  Private (Patient only)
 */
router.get('/doctors/:id/availability', 
    authenticateToken, 
    validate(getDoctorAvailabilitySchema),
    getDoctorAvailability
);

/**
 * @route   GET /api/patients/stats
 * @desc    Get patient statistics
 * @access  Private (Patient only)
 */
router.get('/stats', authenticateToken, getPatientStats);

/**
 * @route   GET /api/patients/medical-records
 * @desc    Get patient's medical records
 * @access  Private (Patient only)
 */
router.get('/medical-records', authenticateToken, getPatientMedicalRecords);

/**
 * @route   GET /api/patients/medical-records/:id
 * @desc    Get specific medical record by ID
 * @access  Private (Patient only)
 */
router.get('/medical-records/:id', authenticateToken, getPatientMedicalRecordById);

module.exports = router;
