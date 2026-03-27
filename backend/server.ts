import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import path from 'path';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandling';
import { apiLimiter } from './middleware/rateLimiting';
import crypto from 'crypto';
// Ensure env is loaded in all run modes
import './config/loadEnv';

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Request ID middleware for tracing
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).id = crypto.randomUUID();
  next();
});

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Configure CORS to allow requests from frontend
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
const envOrigin = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
const extraOrigins = process.env.DEV_ORIGINS ? process.env.DEV_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : [];
const allowedOrigins = (envOrigin.length || extraOrigins.length) ? [...envOrigin, ...extraOrigins] : defaultOrigins;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Special handling for Stripe webhooks (they need raw body) — only enable if STRIPE_ENABLED !== 'false'
if (process.env.STRIPE_ENABLED !== 'false') {
  app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));
}

// Regular JSON parsing with size limit
app.use(express.json({ limit: '2mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter as any);

app.use('/api', apiRouter);

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

  // Check database health on startup
  const { checkDatabaseHealth } = await import('./services/databaseHealth');
  const health = await checkDatabaseHealth();

  if (!health.isHealthy) {
    console.warn('\n⚠️  WARNING: Database not ready!');
    console.warn('   Credits and unlimited status will NOT persist across sessions.');
    console.warn('   Please apply database migrations. See: APPLY_MIGRATIONS.md\n');
  }
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  // Force shutdown after 10s
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
