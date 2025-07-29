const express = require('express');
const config = require('../config/server');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: require('../../package.json').version,
    status: 'healthy'
  };

  res.status(200).json({
    success: true,
    data: healthCheck
  });
}));

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with dependencies
 * @access  Public
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const checks = {
    server: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    },
    database: {
      status: 'unknown',
      connected: false
    },
    externalAPIs: {
      claude: {
        configured: !!config.apis.claude.apiKey,
        status: config.apis.claude.apiKey ? 'configured' : 'not_configured'
      },
      news: {
        configured: !!config.apis.news.apiKey,
        status: config.apis.news.apiKey ? 'configured' : 'not_configured'
      }
    }
  };

  // Check database connection
  try {
    if (database.getDatabase()) {
      await database.get('SELECT 1 as test');
      checks.database.status = 'healthy';
      checks.database.connected = true;
    }
  } catch (error) {
    checks.database.status = 'unhealthy';
    checks.database.error = error.message;
  }

  // Determine overall status
  const overallStatus = Object.values(checks).every(check => 
    typeof check === 'object' && (check.status === 'healthy' || check.status === 'configured')
  ) ? 'healthy' : 'degraded';

  const healthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: require('../../package.json').version,
    checks
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    success: overallStatus === 'healthy',
    data: healthCheck
  });
}));

/**
 * @route   GET /health/ready
 * @desc    Readiness probe for Kubernetes/Docker
 * @access  Public
 */
router.get('/ready', asyncHandler(async (req, res) => {
  // Check if all critical services are ready
  const checks = [];

  // Database readiness
  try {
    await database.get('SELECT 1 as test');
    checks.push({ service: 'database', ready: true });
  } catch (error) {
    checks.push({ service: 'database', ready: false, error: error.message });
  }

  const allReady = checks.every(check => check.ready);
  const statusCode = allReady ? 200 : 503;

  res.status(statusCode).json({
    success: allReady,
    ready: allReady,
    checks,
    timestamp: new Date().toISOString()
  });
}));

/**
 * @route   GET /health/live
 * @desc    Liveness probe for Kubernetes/Docker
 * @access  Public
 */
router.get('/live', (req, res) => {
  // Simple liveness check - server is running
  res.status(200).json({
    success: true,
    alive: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;