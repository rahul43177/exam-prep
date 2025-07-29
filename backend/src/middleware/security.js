const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/server');

/**
 * Security middleware configuration
 */

// Rate limiting configuration
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.security.rateLimitWindowMs,
    max: options.max || config.security.rateLimitMax,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests to allow more actual work
    skipSuccessfulRequests: false,
    // Skip failed requests
    skipFailedRequests: false
  });
};

// General rate limiter
const generalRateLimit = createRateLimiter();

// Strict rate limiter for auth endpoints
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.'
    }
  }
});

// API rate limiter for external services
const apiRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10 // 10 API calls per minute
});

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Basic XSS protection - escape HTML in string inputs
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.replace(/[<>\"']/g, (match) => {
        const escapeMap = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return escapeMap[match];
      });
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeValue(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      });
    }
  };

  // Sanitize request body
  if (req.body) {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent caching sensitive data
  if (req.path.includes('/api/auth') || req.path.includes('/api/user')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = {
  helmet: helmetConfig,
  generalRateLimit,
  authRateLimit,
  apiRateLimit,
  sanitizeInput,
  securityHeaders,
  createRateLimiter
};