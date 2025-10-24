import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import path from 'path';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandling';
import { apiLimiter } from './middleware/rateLimiting';
// Ensure env is loaded in all run modes
import './config/loadEnv';

const app = express();

// Request logging (before other middleware)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

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

// Regular JSON parsing for other routes
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter as any);

app.use('/api', apiRouter);

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  
  // Check database health on startup
  const { checkDatabaseHealth } = await import('./services/databaseHealth');
  const health = await checkDatabaseHealth();
  
  if (!health.isHealthy) {
    console.warn('\n⚠️  WARNING: Database not ready!');
    console.warn('   Credits and unlimited status will NOT persist across sessions.');
    console.warn('   Please apply database migrations. See: APPLY_MIGRATIONS.md\n');
  }
});

export default app;
