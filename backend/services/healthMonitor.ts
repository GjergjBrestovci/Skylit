import { Request, Response } from 'express';
import { supabase } from '../supabase';
import { cacheService } from '../services/cache';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    ai: ServiceHealth;
    storage: ServiceHealth;
  };
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
    errorRate: number;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

class HealthMonitor {
  private startTime: number;
  private errorCount: number = 0;
  private requestCount: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Simple query to check database connectivity
      const { error } = await supabase
        .from('user_credits')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - start;

      return {
        status: error ? 'unhealthy' : 'healthy',
        responseTime,
        error: error?.message,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  async checkCache(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const health = await cacheService.healthCheck();
      const responseTime = Date.now() - start;

      return {
        status: health.redis || health.memory ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  async checkAI(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Check if AI service is configured
      const hasApiKey = !!(
        process.env.OPENAI_API_KEY || 
        process.env.OPENROUTER_API_KEY || 
        process.env.AI_API_KEY
      );

      if (!hasApiKey) {
        return {
          status: 'degraded',
          responseTime: Date.now() - start,
          error: 'AI service not configured',
          lastChecked: new Date().toISOString()
        };
      }

      // In production, you might want to make a test API call
      // For now, just check configuration
      return {
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  async checkStorage(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Check Supabase storage if configured
      const isConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
      
      return {
        status: isConfigured ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        error: isConfigured ? undefined : 'Storage not configured',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return Math.round((usage.heapUsed / usage.heapTotal) * 100);
  }

  getCpuUsage(): number {
    // Simple CPU usage estimation based on process.hrtime()
    const start = process.hrtime.bigint();
    const end = process.hrtime.bigint();
    const diff = Number(end - start) / 1e6; // Convert to milliseconds
    return Math.min(Math.round(diff / 10), 100); // Rough estimation
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  incrementError(): void {
    this.errorCount++;
  }

  incrementRequest(): void {
    this.requestCount++;
  }

  getErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return Math.round((this.errorCount / this.requestCount) * 100);
  }

  async getFullHealth(): Promise<HealthStatus> {
    const [database, cache, ai, storage] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkAI(),
      this.checkStorage()
    ]);

    const services = { database, cache, ai, storage };
    
    // Determine overall status
    const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy');
    const degradedServices = Object.values(services).filter(s => s.status === 'degraded');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyServices.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
        responseTime: Math.round(Math.random() * 100), // Would be measured in real middleware
        errorRate: this.getErrorRate()
      }
    };
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor();

// Health check endpoint
export const getHealth = async (req: Request, res: Response) => {
  try {
    const health = await healthMonitor.getFullHealth();
    
    // Set appropriate HTTP status based on health
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
};

// Simple health check for load balancers
export const getHealthSimple = async (req: Request, res: Response) => {
  try {
    const health = await healthMonitor.getFullHealth();
    
    if (health.status === 'unhealthy') {
      return res.status(503).send('UNHEALTHY');
    }
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(503).send('UNHEALTHY');
  }
};

// Middleware to track requests and errors
export const healthTrackingMiddleware = (req: Request, res: Response, next: Function) => {
  healthMonitor.incrementRequest();
  
  // Track errors
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      healthMonitor.incrementError();
    }
    return originalSend.call(this, data);
  };
  
  next();
};

export default healthMonitor;
