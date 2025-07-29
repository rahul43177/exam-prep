# IB ACIO Preparation System - Backend API

Backend API server for the IB ACIO AI-powered exam preparation system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3001`

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## 📊 Health Checks

- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Readiness Probe**: `GET /health/ready`
- **Liveness Probe**: `GET /health/live`

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_PATH=./data/ib_acio.db

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# External APIs
CLAUDE_API_KEY=your_claude_api_key_here
NEWS_API_KEY=your_news_api_key_here
```

### Database

The application uses SQLite for development with easy migration to PostgreSQL for production.

Database file location: `./data/ib_acio.db`

## 🏗 Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── dao/            # Data access objects
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── migrations/     # Database migrations
├── tests/              # Test files
├── docs/               # API documentation
├── data/               # Database files
└── scripts/            # Utility scripts
```

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Sanitization** - XSS protection
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption

## 📝 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-07-29T10:30:00Z",
  "requestId": "req_12345"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2025-07-29T10:30:00Z",
  "requestId": "req_12345"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 📊 Logging

Logs are written to:
- Console (development)
- `./logs/app.log` (all logs)
- `./logs/error.log` (errors only)
- `./logs/access.log` (HTTP requests)

Log levels: `error`, `warn`, `info`, `http`, `debug`

## 🚀 Deployment

### Production Build
```bash
NODE_ENV=production npm start
```

### Environment-specific Configuration
- Development: `.env`
- Production: Set environment variables directly

## 📈 Monitoring

### Health Endpoints
- `/health` - Basic server health
- `/health/detailed` - Comprehensive health check
- `/health/ready` - Kubernetes readiness probe
- `/health/live` - Kubernetes liveness probe

### Metrics
- Request/response times
- Error rates
- Database query performance
- External API response times

## 🤝 Development

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- 2-space indentation
- Single quotes for strings

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests and linting
4. Commit with descriptive message
5. Push and create PR

### Adding New Features
1. Create route in `src/routes/`
2. Add controller in `src/controllers/`
3. Implement service in `src/services/`
4. Add tests in `tests/`
5. Update documentation

## 🔧 Troubleshooting

### Common Issues

**Port already in use**
```bash
lsof -ti:3001 | xargs kill -9
```

**Database locked**
```bash
rm ./data/ib_acio.db-wal ./data/ib_acio.db-shm
```

**Permission errors**
```bash
sudo chown -R $USER:$USER ./data ./logs
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Need Help?** 
- Check the logs in `./logs/`
- Use health endpoints for diagnostics
- Run tests to verify functionality