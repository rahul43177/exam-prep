require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || './data/ib_acio.db',
    url: process.env.DATABASE_URL || 'sqlite:./data/ib_acio.db'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    optionsSuccessStatus: 200
  },

  // External APIs
  apis: {
    claude: {
      apiKey: process.env.CLAUDE_API_KEY,
      baseUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1',
      timeout: 30000
    },
    news: {
      apiKey: process.env.NEWS_API_KEY,
      baseUrl: process.env.NEWS_API_URL || 'https://newsapi.org/v2',
      timeout: 10000
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100
  },

  // Development Configuration
  development: {
    debug: process.env.DEBUG || false,
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    apiDocsPath: process.env.API_DOCS_PATH || '/api-docs'
  }
};

// Validation for required environment variables
const requiredEnvVars = ['JWT_SECRET'];

function validateConfig() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using fallback values. Set these in production!');
  }

  // Validate JWT secret strength in production
  if (config.server.env === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }

  return true;
}

validateConfig();

module.exports = config;