const App = require('./app');
const config = require('./config/server');
const logger = require('./config/logger');

/**
 * Server startup and graceful shutdown
 */
class Server {
  constructor() {
    this.app = null;
    this.server = null;
    this.appInstance = null;
  }

  async start() {
    try {
      // Create Express app instance
      this.appInstance = new App();
      this.app = this.appInstance.getApp();

      // Start HTTP server
      this.server = this.app.listen(config.server.port, config.server.host, () => {
        logger.info(`
🚀 IB ACIO Preparation System Backend Server Started!
📍 Environment: ${config.server.env}
🌐 Server URL: http://${config.server.host}:${config.server.port}
📊 Health Check: http://${config.server.host}:${config.server.port}/health
📚 API Endpoint: http://${config.server.host}:${config.server.port}/api/v1
${config.development.enableSwagger ? `📖 API Docs: http://${config.server.host}:${config.server.port}${config.development.apiDocsPath}` : ''}
🕐 Started at: ${new Date().toISOString()}
        `);
      });

      // Handle server errors
      this.server.on('error', (error) => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        const bind = typeof config.server.port === 'string'
          ? 'Pipe ' + config.server.port
          : 'Port ' + config.server.port;

        switch (error.code) {
          case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
          default:
            throw error;
        }
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      return this.server;
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      // Stop accepting new connections
      this.server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }

        try {
          // Close database connections
          if (this.appInstance) {
            await this.appInstance.close();
          }

          logger.info('Server shut down gracefully');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000); // 10 seconds timeout
    };

    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('UNHANDLED_REJECTION');
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = Server;