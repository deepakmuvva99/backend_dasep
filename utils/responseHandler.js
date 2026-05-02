/**
 * Centralized response formatters for success and error payloads.
 * Ensures that the entire API follows the Standard Response Format detailed in the docs.
 */

exports.successResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data: data
    });
};

exports.successListResponse = (res, data, paginationMeta, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data: data,
        pagination: paginationMeta
    });
};

exports.errorResponse = (res, code, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code: code,
            message: message
        }
    });
};
