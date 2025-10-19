const { z } = require('zod');

/**
 * Validation schemas for authentication endpoints
 */

// Password validation schema
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Email validation schema
const emailSchema = z.string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim();

// Phone validation schema (Pakistan format +92 XXX XXXXXXX or international)
const phoneSchema = z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(/^[\+]?[0-9\s\-()]+$/, 'Phone number can only contain digits, +, spaces, hyphens, and parentheses')
    .refine(
        (val) => {
            const digits = val.replace(/\D/g, '');
            return digits.length >= 10 && digits.length <= 15;
        },
        { message: 'Phone number must contain 10-15 digits' }
    )
    .optional();

// Role validation schema
const roleSchema = z.enum(['admin', 'doctor', 'patient'], {
    errorMap: () => ({ message: 'Role must be one of: admin, doctor, patient' })
});

// Registration validation schema
const registerSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: passwordSchema,
        role: roleSchema,
        firstName: z.string()
            .min(2, 'First name must be at least 2 characters long')
            .max(100, 'First name must not exceed 100 characters')
            .trim(),
        lastName: z.string()
            .min(2, 'Last name must be at least 2 characters long')
            .max(100, 'Last name must not exceed 100 characters')
            .trim(),
        phone: phoneSchema,
        dateOfBirth: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
            .optional(),
        gender: z.enum(['male', 'female', 'other'], {
            errorMap: () => ({ message: 'Gender must be one of: male, female, other' })
        }).optional(),
        address: z.string()
            .max(500, 'Address must not exceed 500 characters')
            .optional(),
        // Doctor-specific fields
        specialization: z.string()
            .max(100, 'Specialization must not exceed 100 characters')
            .optional(),
        licenseNumber: z.string()
            .max(50, 'License number must not exceed 50 characters')
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
            .optional(),
        // Patient-specific fields
        bloodGroup: z.string()
            .max(5, 'Blood group must not exceed 5 characters')
            .optional(),
        allergies: z.string()
            .max(1000, 'Allergies must not exceed 1000 characters')
            .optional(),
        emergencyContact: z.string()
            .min(10, 'Emergency contact must be at least 10 characters')
            .max(20, 'Emergency contact must not exceed 20 characters')
            .regex(/^[\+]?[0-9\s\-()]+$/, 'Emergency contact can only contain digits, +, spaces, hyphens, and parentheses')
            .refine(
                (val) => {
                    const digits = val.replace(/\D/g, '');
                    return digits.length >= 10 && digits.length <= 15;
                },
                { message: 'Emergency contact must contain 10-15 digits' }
            )
            .optional()
    })
});

// Login validation schema
const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string()
            .min(1, 'Password is required')
    })
});

// Change password validation schema
const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string()
            .min(1, 'Current password is required'),
        newPassword: passwordSchema
    })
});

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
        gender: z.enum(['male', 'female', 'other']).optional(),
        address: z.string()
            .max(500, 'Address must not exceed 500 characters')
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
    registerSchema,
    loginSchema,
    changePasswordSchema,
    updateProfileSchema,
    validate,
    // Export individual schemas for direct use
    passwordSchema,
    emailSchema,
    phoneSchema,
    roleSchema
};
