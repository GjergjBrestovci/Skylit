import { Request, Response, NextFunction } from 'express';

// Augment Express Request to carry requestId and userId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userId?: string;
    }
  }
}

// Error interface
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

// Global error handler
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    statusCode = 401;
    message = 'Unauthorized';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  const logPayload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode,
    ip: req.ip,
    userId: req.userId,
    error: err.message,
  };
  if (isDevelopment) logPayload.stack = err.stack;
  console.error(JSON.stringify(logPayload));

  res.status(statusCode).json({
    error: message,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(isDevelopment && { stack: err.stack }),
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
};

// Request logging middleware (runs in all environments)
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  const originalEnd = res.end.bind(res);
  (res as any).end = function (...args: Parameters<typeof res.end>) {
    const duration = Date.now() - start;
    const isDev = process.env.NODE_ENV === 'development';
    const log: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration_ms: duration,
      ip: req.ip,
      userId: req.userId,
    };
    if (isDev) log.userAgent = req.get('User-Agent');
    console.log(JSON.stringify(log));
    return originalEnd(...args);
  };

  next();
};
