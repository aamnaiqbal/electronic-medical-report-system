const express = require('express');
const { 
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
} = require('../controllers/doctorController');
const { authenticateToken } = require('../middleware/auth');
const { 
    isDoctorOrAdmin, 
    isDoctorOnly, 
    isDoctorAppointment, 
    isOwnDoctorProfile,
    doctorExists,
    optionalDoctorAuth
} = require('../middleware/doctorAuth');
const { query } = require('../middleware/pagination');
const { 
    validate, 
    updateDoctorProfileSchema,
    getDoctorAppointmentsQuerySchema,
    getDoctorPatientsQuerySchema,
    getAppointmentByIdSchema,
    updateAppointmentStatusParamsSchema,
    appointmentStatusSchema,
    getDoctorByIdSchema,
    searchDoctorsQuerySchema,
    getAllDoctorsQuerySchema
} = require('../validators/doctorValidator');

const router = express.Router();

/**
 * Doctor Routes
 * Mix of authenticated doctor routes and public doctor listing routes
 */

// ==================== AUTHENTICATED DOCTOR ROUTES ====================

/**
 * @route   GET /api/doctors/profile
 * @desc    Get doctor profile (authenticated doctor)
 * @access  Private (Doctor only)
 */
router.get('/profile', authenticateToken, isDoctorOnly, getDoctorProfile);

/**
 * @route   PUT /api/doctors/profile
 * @desc    Update doctor profile (authenticated doctor)
 * @access  Private (Doctor only)
 */
router.put('/profile', 
    authenticateToken, 
    isDoctorOnly, 
    isOwnDoctorProfile,
    validate(updateDoctorProfileSchema), 
    updateDoctorProfile
);

/**
 * @route   GET /api/doctors/appointments
 * @desc    Get doctor's appointments with filters and pagination
 * @access  Private (Doctor only)
 */
router.get('/appointments', 
    authenticateToken, 
    isDoctorOnly, 
    query, 
    validate(getDoctorAppointmentsQuerySchema), 
    getDoctorAppointmentsController
);

/**
 * @route   GET /api/doctors/appointments/:id
 * @desc    Get specific appointment (authenticated doctor)
 * @access  Private (Doctor only)
 */
router.get('/appointments/:id', 
    authenticateToken, 
    isDoctorOnly, 
    validate(getAppointmentByIdSchema),
    isDoctorAppointment,
    getAppointmentById
);

/**
 * @route   PUT /api/doctors/appointments/:id/status
 * @desc    Update appointment status (authenticated doctor)
 * @access  Private (Doctor only)
 */
router.put('/appointments/:id/status', 
    authenticateToken, 
    isDoctorOnly, 
    validate(updateAppointmentStatusParamsSchema),
    validate(appointmentStatusSchema),
    isDoctorAppointment,
    updateAppointmentStatus
);

/**
 * @route   GET /api/doctors/patients
 * @desc    Get doctor's patients list
 * @access  Private (Doctor only)
 */
router.get('/patients', 
    authenticateToken, 
    isDoctorOnly, 
    query, 
    validate(getDoctorPatientsQuerySchema), 
    getDoctorPatientsController
);

/**
 * @route   GET /api/doctors/patients/:id
 * @desc    Get specific patient details
 * @access  Private (Doctor only)
 */
router.get('/patients/:id', 
    authenticateToken, 
    isDoctorOnly, 
    getPatientByIdController
);

/**
 * @route   POST /api/doctors/medical-records
 * @desc    Create medical record for a patient
 * @access  Private (Doctor only)
 */
router.post('/medical-records', 
    authenticateToken, 
    isDoctorOnly, 
    createMedicalRecordController
);

/**
 * @route   GET /api/doctors/patients/:patientId/medical-records
 * @desc    Get patient's medical records
 * @access  Private (Doctor only)
 */
router.get('/patients/:patientId/medical-records', 
    authenticateToken, 
    isDoctorOnly, 
    getPatientMedicalRecordsController
);

/**
 * @route   GET /api/doctors/stats
 * @desc    Get doctor statistics
 * @access  Private (Doctor only)
 */
router.get('/stats', authenticateToken, isDoctorOnly, getDoctorStatsController);

// ==================== PUBLIC DOCTOR ROUTES ====================

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors (public listing for booking)
 * @access  Public
 */
router.get('/', 
    optionalDoctorAuth,
    query, 
    validate(getAllDoctorsQuerySchema), 
    getAllDoctorsController
);

/**
 * @route   GET /api/doctors/search
 * @desc    Search doctors (public)
 * @access  Public
 */
router.get('/search', 
    optionalDoctorAuth,
    query, 
    validate(searchDoctorsQuerySchema), 
    searchDoctorsController
);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor details by ID (public)
 * @access  Public
 */
router.get('/:id', 
    optionalDoctorAuth,
    validate(getDoctorByIdSchema),
    doctorExists,
    getDoctorByIdController
);

module.exports = router;
