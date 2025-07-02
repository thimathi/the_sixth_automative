class ReportGenerationError extends Error {
    constructor(message, reportId, generationStage) {
        super(message);
        this.name = 'ReportGenerationError';
        this.isReportError = true;
        this.reportId = reportId;
        this.generationStage = generationStage;
        this.statusCode = 400; // Bad Request
        this.isOperational = true;
    }
}

class ReportValidationError extends ReportGenerationError {
    constructor(message, reportId, missingFields) {
        super(message, reportId, 'validation');
        this.name = 'ReportValidationError';
        this.missingData = missingFields;
    }
}

class ReportProcessingError extends ReportGenerationError {
    constructor(message, reportId) {
        super(message, reportId, 'processing');
        this.name = 'ReportProcessingError';
        this.statusCode = 500;
    }
}

class ReportNotFoundError extends Error {
    constructor(reportId) {
        super(`Report ${reportId} not found`);
        this.name = 'ReportNotFoundError';
        this.reportId = reportId;
        this.statusCode = 404;
        this.isOperational = true;
    }
}

const isOperationalError = (error) => {
    if (error.isOperational) {
        return true;
    }
    return false;
};

module.exports = {
    ReportGenerationError,
    ReportValidationError,
    ReportProcessingError,
    ReportNotFoundError,
    isOperationalError
};