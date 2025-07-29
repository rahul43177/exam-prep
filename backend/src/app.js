const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config/server');
const logger = require('./config/logger');
const database = require('./config/database');

// Import middleware
const { corsMiddleware, handleCorsError } = require('./middleware/cors');
const { 
  helmet, 
  generalRateLimit, 
  sanitizeInput, 
  securityHeaders 
} = require('./middleware/security');
const { 
  errorHandler, 
  notFoundHandler 
} = require('./middleware/errorHandler');

// Import routes
const healthRoutes = require('./routes/health');

/**
 * Express application setup
 */
class App {
  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    try {
      await database.initialize();
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    }
  }

  initializeMiddleware() {
    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet);
    this.app.use(securityHeaders);

    // CORS middleware
    this.app.use(corsMiddleware);

    // Compression middleware
    this.app.use(compression({
      level: config.server.env === 'production' ? 6 : 1,
      threshold: 1024
    }));

    // Request logging middleware
    const logFormat = config.server.env === 'production' 
      ? 'combined' 
      : ':method :url :status :res[content-length] - :response-time ms';
    
    this.app.use(morgan(logFormat, { 
      stream: logger.stream,
      skip: (req, res) => {
        // Skip health check logs in production
        return config.server.env === 'production' && req.url.startsWith('/health');
      }
    }));

    // Request ID middleware
    this.app.use(logger.addRequestId);

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true
    }));
    
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Input sanitization
    this.app.use(sanitizeInput);

    // Rate limiting (applied globally)
    if (config.server.env === 'production') {
      this.app.use(generalRateLimit);
    }

    // Request timing middleware
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      res.on('finish', () => {
        const responseTime = Date.now() - req.startTime;
        logger.logRequest(req, res.statusCode, responseTime);
      });
      next();
    });

    logger.info('Middleware initialized successfully');
  }

  initializeRoutes() {
    // API routes prefix
    const API_PREFIX = '/api/v1';

    // Health check routes (no prefix for easier monitoring)
    this.app.use('/health', healthRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'IB ACIO Preparation System API',
        version: require('../package.json').version,
        environment: config.server.env,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          healthDetailed: '/health/detailed',
          ready: '/health/ready',
          live: '/health/live',
          api: API_PREFIX
        }
      });
    });

    // API version info
    this.app.get(API_PREFIX, (req, res) => {
      res.json({
        success: true,
        message: 'IB ACIO Preparation System API v1',
        version: require('../package.json').version,
        documentation: config.development.enableSwagger ? `${req.protocol}://${req.get('host')}${config.development.apiDocsPath}` : undefined,
        endpoints: {
          auth: `${API_PREFIX}/auth`,
          questions: `${API_PREFIX}/questions`,
          exams: `${API_PREFIX}/exams`,
          analytics: `${API_PREFIX}/analytics`
        }
      });
    });

    // TODO: Add API routes here as they're implemented
    // this.app.use(`${API_PREFIX}/auth`, authRoutes);
    // this.app.use(`${API_PREFIX}/questions`, questionRoutes);
    // this.app.use(`${API_PREFIX}/exams`, examRoutes);
    // this.app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

    logger.info('Routes initialized successfully');
  }

  initializeErrorHandling() {
    // CORS error handler
    this.app.use(handleCorsError);

    // 404 handler for undefined routes
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    logger.info('Error handling initialized successfully');
  }

  getApp() {
    return this.app;
  }

  async close() {
    try {
      await database.close();
      logger.info('Application closed gracefully');
    } catch (error) {
      logger.error('Error closing application:', error);
    }
  }
}

module.exports = App;
