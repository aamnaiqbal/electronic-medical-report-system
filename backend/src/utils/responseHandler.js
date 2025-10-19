/**
 * Response Handler Utility
 * Provides consistent API response formatting
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
    const response = {
        success: true,
        message,
        ...(data && { data }),
        ...(meta && { meta })
    };

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Validation errors or additional error details
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const response = {
        success: false,
        message,
        ...(errors && { errors })
    };

    return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 */
const validationErrorResponse = (res, errors) => {
    return errorResponse(res, 400, 'Validation failed', errors);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return errorResponse(res, 401, message);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
    return errorResponse(res, 403, message);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
    return errorResponse(res, 404, message);
};

/**
 * Send conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 */
const conflictResponse = (res, message = 'Resource already exists') => {
    return errorResponse(res, 409, message);
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse
};
