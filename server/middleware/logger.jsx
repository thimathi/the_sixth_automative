const winston = require('winston');
const { combine, timestamp, printf, colorize, json } = winston.format;
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log severity levels
const levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    http: 5,
    report: 6 // Custom level for report-specific logging
};

// Custom colors for different log levels
winston.addColors({
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    http: 'magenta',
    report: 'cyan'
});

// Custom format for console output
const consoleFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    })
);

// JSON format for file output
const fileFormat = combine(
    timestamp(),
    json()
);

// Configure transports based on environment
const transports = [
    new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: consoleFormat
    }),
    new DailyRotateFile({
        filename: path.join(__dirname, '../logs/application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'info',
        format: fileFormat
    }),
    new DailyRotateFile({
        filename: path.join(__dirname, '../logs/reports-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'report',
        format: fileFormat
    }),
    new DailyRotateFile({
        filename: path.join(__dirname, '../logs/error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: fileFormat
    })
];

// Create the logger instance
const logger = winston.createLogger({
    levels,
    transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/rejections.log')
        })
    ],
    exitOnError: false
});

// Custom report logger methods
logger.report = {
    generationStart: (reportId, type) => {
        logger.log({
            level: 'report',
            message: 'Report generation started',
            reportId,
            type,
            status: 'started'
        });
    },
    generationComplete: (reportId, type, durationMs) => {
        logger.log({
            level: 'report',
            message: 'Report generation completed',
            reportId,
            type,
            status: 'completed',
            durationMs
        });
    },
    generationFailed: (reportId, type, error, stage) => {
        logger.error({
            level: 'report',
            message: 'Report generation failed',
            reportId,
            type,
            status: 'failed',
            error: error.message,
            stack: error.stack,
            stage
        });
    },
    download: (reportId, userId) => {
        logger.log({
            level: 'report',
            message: 'Report downloaded',
            reportId,
            userId
        });
    }
};

// Morgan stream for HTTP logging
logger.morganStream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

module.exports = logger;