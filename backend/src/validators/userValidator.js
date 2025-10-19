const { z } = require('zod');

/**
 * Validation schemas for user management endpoints
 */

// Phone validation schema
const phoneSchema = z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number')
    .optional();

// Update profile validation schema
const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string()
            .min(2, 'First name must be at least 2 characters long')
            .max(100, 'First name must not exceed 100 characters')
            .trim()
            .optional(),
        lastName: z.string()
            .min(2, 'Last name must be at least 2 characters long')
            .max(100, 'Last name must not exceed 100 characters')
            .trim()
            .optional(),
        phone: phoneSchema,
        dateOfBirth: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
            .optional(),
        gender: z.enum(['male', 'female', 'other'], {
            errorMap: () => ({ message: 'Gender must be one of: male, female, other' })
        }).optional(),
        address: z.string()
            .max(500, 'Address must not exceed 500 characters')
            .optional()
    })
});

// Change password validation schema
const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string()
            .min(1, 'Current password is required'),
        newPassword: z.string()
            .min(8, 'New password must be at least 8 characters long')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
        confirmPassword: z.string()
            .min(1, 'Password confirmation is required')
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })
});

// Update user role validation schema (admin only)
const updateUserRoleSchema = z.object({
    body: z.object({
        role: z.enum(['admin', 'doctor', 'patient'], {
            errorMap: () => ({ message: 'Role must be one of: admin, doctor, patient' })
        })
    })
});

// Get users query validation schema
const getUsersQuerySchema = z.object({
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
        role: z.enum(['admin', 'doctor', 'patient']).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        sortBy: z.string()
            .max(50, 'Sort field must not exceed 50 characters')
            .optional(),
        sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
        createdFrom: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Created from date must be in YYYY-MM-DD format')
            .optional(),
        createdTo: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Created to date must be in YYYY-MM-DD format')
            .optional()
    })
});

// Get user by ID params validation schema
const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'User ID must be a positive integer')
    })
});

// Delete user params validation schema
const deleteUserSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'User ID must be a positive integer')
    }),
    query: z.object({
        permanent: z.enum(['true', 'false']).optional()
    })
});

// Update user role params validation schema
const updateUserRoleParamsSchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, 'User ID must be a positive integer')
    })
});

// Doctor-specific profile update schema
const updateDoctorProfileSchema = z.object({
    body: z.object({
        specialization: z.string()
            .min(2, 'Specialization must be at least 2 characters long')
            .max(100, 'Specialization must not exceed 100 characters')
            .optional(),
        qualification: z.string()
            .max(1000, 'Qualification must not exceed 1000 characters')
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

// Patient-specific profile update schema
const updatePatientProfileSchema = z.object({
    body: z.object({
        bloodGroup: z.string()
            .max(5, 'Blood group must not exceed 5 characters')
            .optional(),
        allergies: z.string()
            .max(1000, 'Allergies must not exceed 1000 characters')
            .optional(),
        emergencyContact: z.string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid emergency contact number')
            .optional()
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
    updateProfileSchema,
    changePasswordSchema,
    updateUserRoleSchema,
    getUsersQuerySchema,
    getUserByIdSchema,
    deleteUserSchema,
    updateUserRoleParamsSchema,
    updateDoctorProfileSchema,
    updatePatientProfileSchema,
    validate
};
