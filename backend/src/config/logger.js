const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'ib-acio-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true
    }),

    // Separate file for error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3
    }),

    // Separate file for HTTP access logs
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ],

  // Don't exit on handled exceptions
  exitOnError: false
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Add request ID tracking for better debugging
logger.addRequestId = (req, res, next) => {
  req.requestId = require('uuid').v4();
  logger.defaultMeta = { 
    ...logger.defaultMeta, 
    requestId: req.requestId 
  };
  next();
};

// Helper methods for structured logging
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context
  });
};

logger.logRequest = (req, statusCode, responseTime) => {
  logger.http({
    method: req.method,
    url: req.url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.requestId
  });
};

logger.logApiCall = (service, method, url, statusCode, responseTime) => {
  logger.info({
    type: 'external_api_call',
    service,
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`
  });
};

logger.logDatabaseQuery = (query, params, executionTime) => {
  logger.debug({
    type: 'database_query',
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    paramCount: params ? params.length : 0,
    executionTime: `${executionTime}ms`
  });
};

module.exports = logger;