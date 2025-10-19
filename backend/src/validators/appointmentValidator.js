const { z } = require('zod');

/**
 * Validation schemas for appointment-related endpoints
 */

// Book appointment validation schema
const bookAppointmentSchema = z.object({
    body: z.object({
        doctorId: z.number()
            .int('Doctor ID must be an integer')
            .positive('Doctor ID must be positive'),
        appointmentDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be in YYYY-MM-DD format')
            .refine((date) => {
                const appointmentDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return appointmentDate >= today;
            }, 'Appointment date must be in the future'),
        appointmentTime: z.string()
            .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Appointment time must be in HH:MM:SS format'),
        reason: z.string()
            .min(3, 'Reason must be at least 3 characters long')
            .max(500, 'Reason must not exceed 500 characters')
            .optional(),
        notes: z.string()
            .max(1000, 'Notes must not exceed 1000 characters')
            .optional()
    })
});

// Cancel appointment validation schema
const cancelAppointmentSchema = z.object({
    body: z.object({
        reason: z.string()
            .min(5, 'Cancellation reason must be at least 5 characters long')
            .max(500, 'Cancellation reason must not exceed 500 characters')
            .optional()
    })
});

// Get appointments query validation schema
const getAppointmentsQuerySchema = z.object({
    query: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .optional(),
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
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

// Get appointment by ID params validation schema
const getAppointmentByIdSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Appointment ID must be a positive integer')
    })
});

// Cancel appointment params validation schema
const cancelAppointmentParamsSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Appointment ID must be a positive integer')
    })
});

// Get doctor availability query validation schema
const getDoctorAvailabilityQuerySchema = z.object({
    query: z.object({
        date: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .refine((date) => {
                const appointmentDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return appointmentDate >= today;
            }, 'Date must be in the future')
    })
});

// Get doctor by ID params validation schema
const getDoctorByIdParamsSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Doctor ID must be a positive integer')
    })
});

// Combined schema for doctor availability (params + query)
const getDoctorAvailabilitySchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'Doctor ID must be a positive integer')
    }),
    query: z.object({
        date: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .refine((date) => {
                const appointmentDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return appointmentDate >= today;
            }, 'Date must be in the future')
    })
});

// Update appointment status validation schema
const updateAppointmentStatusSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
            errorMap: () => ({ message: 'Status must be one of: pending, confirmed, completed, cancelled' })
        }),
        notes: z.string()
            .max(1000, 'Notes must not exceed 1000 characters')
            .optional()
    })
});

// Reschedule appointment validation schema
const rescheduleAppointmentSchema = z.object({
    body: z.object({
        appointmentDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be in YYYY-MM-DD format')
            .refine((date) => {
                const appointmentDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return appointmentDate >= today;
            }, 'Appointment date must be in the future'),
        appointmentTime: z.string()
            .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Appointment time must be in HH:MM:SS format'),
        reason: z.string()
            .min(5, 'Reschedule reason must be at least 5 characters long')
            .max(500, 'Reschedule reason must not exceed 500 characters')
            .optional()
    })
});

// Search doctors query validation schema
const searchDoctorsQuerySchema = z.object({
    query: z.object({
        search: z.string()
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

// Update patient profile validation schema
const updatePatientProfileSchema = z.object({
    body: z.object({
        // Basic profile fields
        firstName: z.string()
            .min(2, 'First name must be at least 2 characters')
            .max(100, 'First name must not exceed 100 characters')
            .optional(),
        lastName: z.string()
            .min(2, 'Last name must be at least 2 characters')
            .max(100, 'Last name must not exceed 100 characters')
            .optional(),
        phone: z.string()
            .min(10, 'Phone number must be at least 10 characters')
            .max(20, 'Phone number must not exceed 20 characters')
            .regex(/^[\+]?[0-9\s\-()]+$/, 'Phone number can only contain digits, +, spaces, hyphens, and parentheses')
            .optional(),
        gender: z.enum(['male', 'female', 'other'], {
            errorMap: () => ({ message: 'Gender must be one of: male, female, other' })
        }).optional(),
        dateOfBirth: z.string()
            .transform(val => val === '' ? undefined : val)  // Convert empty string to undefined
            .optional()
            .refine(
                (val) => {
                    // If undefined or null, it's valid (optional)
                    if (!val) return true;
                    // Check if it matches YYYY-MM-DD format
                    return /^\d{4}-\d{2}-\d{2}$/.test(val);
                },
                { message: 'Date of birth must be in YYYY-MM-DD format (e.g., 1990-01-15)' }
            ),
        address: z.string()
            .max(500, 'Address must not exceed 500 characters')
            .optional(),
        // Patient-specific fields
        bloodGroup: z.string()
            .max(5, 'Blood group must not exceed 5 characters')
            .optional(),
        allergies: z.string()
            .optional()
            .transform(val => val === '' ? undefined : val)  // Convert empty string to undefined
            .refine(
                (val) => {
                    // If undefined, it's valid (optional)
                    if (!val) return true;
                    // If has value, check length
                    return val.length <= 1000;
                },
                { message: 'Allergies must not exceed 1000 characters' }
            ),
        emergencyContact: z.string()
            .transform(val => val === '' ? undefined : val)  // Convert empty string to undefined
            .optional()
            .refine(
                (val) => {
                    // If undefined or null, it's valid (optional)
                    if (!val) return true;
                    // If has value, check length and format
                    if (val.length < 10 || val.length > 20) return false;
                    if (!/^[\+]?[0-9\s\-()]+$/.test(val)) return false;
                    const digits = val.replace(/\D/g, '');
                    return digits.length >= 10 && digits.length <= 15;
                },
                { message: 'Emergency contact must be 10-20 characters with valid phone format (+92 XXX XXXXXXX)' }
            )
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
            console.log('=== VALIDATION DEBUG ===');
            console.log('Request body:', req.body);
            console.log('Request method:', req.method);
            console.log('Request URL:', req.url);
            
            // Debug specific field that might be failing
            if (req.body.dateOfBirth) {
                console.log('dateOfBirth value:', req.body.dateOfBirth);
                console.log('dateOfBirth type:', typeof req.body.dateOfBirth);
                console.log('dateOfBirth matches YYYY-MM-DD:', /^\d{4}-\d{2}-\d{2}$/.test(req.body.dateOfBirth));
            }
            
            const result = schema.parse(req);
            req.validatedData = result;
            console.log('Validation successful');
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.log('Validation failed:');
                console.log('Zod errors:', error.errors);
                
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
    bookAppointmentSchema,
    cancelAppointmentSchema,
    getAppointmentsQuerySchema,
    getAppointmentByIdSchema,
    cancelAppointmentParamsSchema,
    getDoctorAvailabilityQuerySchema,
    getDoctorAvailabilitySchema,
    getDoctorByIdParamsSchema,
    updateAppointmentStatusSchema,
    rescheduleAppointmentSchema,
    searchDoctorsQuerySchema,
    updatePatientProfileSchema,
    validate
};
