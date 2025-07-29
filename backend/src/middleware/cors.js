const cors = require('cors');
const config = require('../config/server');

/**
 * CORS middleware configuration
 */

// Basic CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow configured origins
    const allowedOrigins = Array.isArray(config.cors.origin) 
      ? config.cors.origin 
      : [config.cors.origin];
    
    // In development, allow localhost with any port
    if (config.server.env === 'development') {
      allowedOrigins.push(/^http:\/\/localhost:\d+$/);
      allowedOrigins.push(/^http:\/\/127\.0\.0\.1:\d+$/);
    }
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  
  credentials: config.cors.credentials,
  
  // Allow these HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allow these headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  
  // Expose these headers to the client
  exposedHeaders: [
    'X-Total-Count',
    'X-Response-Time',
    'X-Request-ID'
  ],
  
  // How long browsers can cache CORS preflight responses
  maxAge: 86400, // 24 hours
  
  // Pass the CORS preflight response to the next handler
  preflightContinue: false,
  
  // Provide a status code to use for successful OPTIONS requests
  optionsSuccessStatus: 200
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Custom CORS error handler
const handleCorsError = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'Cross-Origin Resource Sharing policy violation',
        details: config.server.env === 'development' ? err.message : undefined
      }
    });
  }
  next(err);
};

// Preflight handler for complex requests
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
};

module.exports = {
  corsMiddleware,
  handleCorsError,
  handlePreflight,
  corsOptions
};