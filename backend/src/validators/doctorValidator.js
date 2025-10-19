const { z } = require('zod');

/**
 * Validation schemas for doctor-specific endpoints
 */

// Update doctor profile validation schema
const updateDoctorProfileSchema = z.object({
    body: z.object({
        specialization: z.string()
            .min(2, 'Specialization must be at least 2 characters long')
            .max(100, 'Specialization must not exceed 100 characters')
            .trim()
            .optional(),
        qualification: z.string()
            .max(1000, 'Qualification must not exceed 1000 characters')
            .trim()
            .optional(),
        experienceYears: z.number()
            .int('Experience years must be an integer')
            .min(0, 'Experience years cannot be negative')
            .max(50, 'Experience years cannot exceed 50')
            .optional(),
        consultationFee: z.number()
            .min(0, 'Consultation fee cannot be negative')
            .max(999999.99, 'Consultation fee is too high')
            .optional()
    })
});

// Appointment status validation schema
const appointmentStatusSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
            errorMap: () => ({ message: 'Status must be one of: pending, confirmed, completed, cancelled' })
        }),
        notes: z.string()
            .max(1000, 'Notes must not exceed 1000 characters')
            .optional()
    })
});

// Get doctor appointments query validation schema
const getDoctorAppointmentsQuerySchema = z.object({
    query: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .optional(),
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
        date: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .optional(),
        dateFrom: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date from must be in YYYY-MM-DD format')
            .optional(),
        dateTo: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date to must be in YYYY-MM-DD format')
            .optional(),
        sortBy: z.string()
            .max(50, 'Sort field must not exceed 50 characters')
            .optional(),
        sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional()
    })
});

// Get doctor patients query validation schema
const getDoctorPatientsQuerySchema = z.object({
    query: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .optional(),
        search: z.string()
            .max(100, 'Search query must not exceed 100 characters')
            .optional(),
        sortBy: z.string()
            .max(50, 'Sort field must not exceed 50 characters')
            .optional(),
        sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional()
    })
});

// Get appointment by ID params validation schema
const getAppointmentByIdSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Appointment ID must be a positive integer')
    })
});

// Update appointment status params validation schema
const updateAppointmentStatusParamsSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Appointment ID must be a positive integer')
    })
});

// Get doctor by ID params validation schema
const getDoctorByIdSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Doctor ID must be a positive integer')
    })
});

// Search doctors query validation schema
const searchDoctorsQuerySchema = z.object({
    query: z.object({
        search: z.string()
            .min(1, 'Search query is required')
            .max(100, 'Search query must not exceed 100 characters')
            .optional(),
        specialization: z.string()
            .max(100, 'Specialization must not exceed 100 characters')
            .optional(),
        experienceMin: z.string()
            .regex(/^\d+$/, 'Minimum experience must be a positive integer')
            .optional(),
        experienceMax: z.string()
            .regex(/^\d+$/, 'Maximum experience must be a positive integer')
            .optional(),
        feeMin: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, 'Minimum fee must be a valid number')
            .optional(),
        feeMax: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, 'Maximum fee must be a valid number')
            .optional(),
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .optional(),
        sortBy: z.string()
            .max(50, 'Sort field must not exceed 50 characters')
            .optional(),
        sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional()
    })
});

// Get all doctors query validation schema
const getAllDoctorsQuerySchema = z.object({
    query: z.object({
        specialization: z.string()
            .max(100, 'Specialization must not exceed 100 characters')
            .optional(),
        experienceMin: z.string()
            .regex(/^\d+$/, 'Minimum experience must be a positive integer')
            .optional(),
        experienceMax: z.string()
            .regex(/^\d+$/, 'Maximum experience must be a positive integer')
            .optional(),
        feeMin: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, 'Minimum fee must be a valid number')
            .optional(),
        feeMax: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, 'Maximum fee must be a valid number')
            .optional(),
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .optional(),
        sortBy: z.string()
            .max(50, 'Sort field must not exceed 50 characters')
            .optional(),
        sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional()
    })
});

/**
 * Validation middleware factory
 * @param {Object} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req);
            req.validatedData = result;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }
            
            next(error);
        }
    };
};

module.exports = {
    updateDoctorProfileSchema,
    appointmentStatusSchema,
    getDoctorAppointmentsQuerySchema,
    getDoctorPatientsQuerySchema,
    getAppointmentByIdSchema,
    updateAppointmentStatusParamsSchema,
    getDoctorByIdSchema,
    searchDoctorsQuerySchema,
    getAllDoctorsQuerySchema,
    validate
};
