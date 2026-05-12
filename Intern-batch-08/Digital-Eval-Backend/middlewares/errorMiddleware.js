const { errorResponse } = require('../utils/responseHandler');

/**
 * Global centralized error handler middleware.
 * Captures all throw errors, validation errors, or DB execution failures.
 */
const errorHandler = (err, req, res, _next) => {
    // Log unexpected errors for auditing (could be pushed to AUDIT_LOGS table natively later)
    console.error('🔥 Error Intercepted:', err.message);

    // Provide generic fallback if custom thrown error does not have specific status
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'APPLICATION_ERROR');
    const errorMessage = err.message || 'An unexpected server error occurred.';

    return errorResponse(res, errorCode, errorMessage, statusCode);
};

// Utility to wrap async routes, catching unhandled promise rejections seamlessly
// preventing 'UnhandledPromiseRejectionWarning' and crashing node.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
