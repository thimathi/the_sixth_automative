const logger = require('./logger'); // Your logging utility
const { isOperationalError } = require('./errorUtils');

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log the error with request context
    logger.error({
        error: err.message,
        stack: err.stack,
        type: err.type || 'UnknownError',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        userId: req.user?.id || 'anonymous'
    });

    // Determine the HTTP status code
    const statusCode = err.statusCode || 500;

    // Prepare error response
    const errorResponse = {
        error: {
            type: err.type || 'InternalServerError',
            message: err.message || 'Something went wrong',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            timestamp: new Date().toISOString(),
            requestId: req.id // Assuming you're using request IDs
        }
    };

    // Special handling for report generation errors
    if (err.isReportError) {
        errorResponse.error.reportId = err.reportId;
        errorResponse.error.generationStage = err.generationStage;

        if (err.missingData) {
            errorResponse.error.missingData = err.missingData;
        }
    }

    // Send the error response
    res.status(statusCode).json(errorResponse);

    // For operational errors, no need to restart
    if (!isOperationalError(err)) {
        process.emit('uncaughtException', err);
    }
};

module.exports = errorHandler;