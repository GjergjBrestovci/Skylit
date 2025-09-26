import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

// Cache configuration
const CACHE_TTL = {
  TEMPLATES: 60 * 60, // 1 hour
  SAMPLE_PROMPTS: 60 * 30, // 30 minutes
  USER_PROJECTS: 60 * 15, // 15 minutes
  GENERATION_RESULT: 60 * 60 * 24, // 24 hours
  PRICING_PLANS: 60 * 60 * 2, // 2 hours
  ANALYTICS: 60 * 5, // 5 minutes
} as const;

// Type definitions
interface CacheEntry<T = any> {
  value: T;
  expires: number;
}

interface HealthCheck {
  redis: boolean;
  memory: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  previewUrl?: string;
}

interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface GenerationResult {
  id: string;
  html: string;
  css?: string;
  javascript?: string;
  previewUrl?: string;
  analysis?: string;
  requirements?: string[];
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeRedis();
    this.startMemoryCleanupInterval();
  }

  private startMemoryCleanupInterval(): void {
    // Clean up expired memory cache entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupMemoryCache();
    }, 5 * 60 * 1000);
  }

  private initializeRedis(): void {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000,
        });

        this.redis.on('error', (error: Error) => {
          console.error('Redis connection error:', error.message);
          this.redis = null; // Fallback to memory cache
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
        });

        this.redis.on('close', () => {
          console.warn('⚠️ Redis connection closed, falling back to memory cache');
        });
      } else {
        console.warn('⚠️ Redis not configured, using memory cache fallback');
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!key) {
      throw new Error('Cache key is required');
    }

    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value !== null) {
          try {
            return JSON.parse(value) as T;
          } catch (parseError) {
            console.error('Failed to parse cached value:', parseError);
            await this.del(key); // Remove corrupted entry
            return null;
          }
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value as T;
      }

      // Remove expired entry
      if (cached) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl: number = 300): Promise<void> {
    if (!key) {
      throw new Error('Cache key is required');
    }

    if (ttl <= 0) {
      throw new Error('TTL must be greater than 0');
    }

    try {
      const serialized = JSON.stringify(value);

      // Try Redis first
      if (this.redis) {
        await this.redis.setex(key, ttl, serialized);
      }

      // Always store in memory cache as backup
      this.memoryCache.set(key, {
        value,
        expires: Date.now() + (ttl * 1000)
      });

    } catch (error) {
      console.error('Cache set error:', error);
      throw new Error(`Failed to cache value for key: ${key}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!key) {
      throw new Error('Cache key is required');
    }

    try {
      if (this.redis) {
        await this.redis.del(key);
      }
      this.memoryCache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!pattern) {
      throw new Error('Cache pattern is required');
    }

    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // Clear matching patterns from memory cache
      const patternRegex = new RegExp(pattern.replace('*', '.*'));
      for (const key of this.memoryCache.keys()) {
        if (patternRegex.test(key)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Cache pattern delete error:', error);
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, { expires }] of this.memoryCache.entries()) {
      if (expires <= now) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  // Helper methods for specific cache operations
  async cacheTemplates(templates: Template[]): Promise<void> {
    await this.set('templates:all', templates, CACHE_TTL.TEMPLATES);
  }

  async getCachedTemplates(): Promise<Template[] | null> {
    return this.get<Template[]>('templates:all');
  }

  async cacheTemplate(templateId: string, template: Template): Promise<void> {
    if (!templateId) {
      throw new Error('Template ID is required');
    }
    await this.set(`template:${templateId}`, template, CACHE_TTL.TEMPLATES);
  }

  async getCachedTemplate(templateId: string): Promise<Template | null> {
    if (!templateId) {
      throw new Error('Template ID is required');
    }
    return this.get<Template>(`template:${templateId}`);
  }

  async cacheUserProjects(userId: string, projects: Project[]): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    await this.set(`user:${userId}:projects`, projects, CACHE_TTL.USER_PROJECTS);
  }

  async getCachedUserProjects(userId: string): Promise<Project[] | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.get<Project[]>(`user:${userId}:projects`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    await this.delPattern(`user:${userId}:*`);
  }

  async cacheGenerationResult(resultId: string, result: GenerationResult): Promise<void> {
    if (!resultId) {
      throw new Error('Result ID is required');
    }
    await this.set(`generation:${resultId}`, result, CACHE_TTL.GENERATION_RESULT);
  }

  async getCachedGenerationResult(resultId: string): Promise<GenerationResult | null> {
    if (!resultId) {
      throw new Error('Result ID is required');
    }
    return this.get<GenerationResult>(`generation:${resultId}`);
  }

  async cachePricingPlans(plans: any[]): Promise<void> {
    await this.set('pricing:plans', plans, CACHE_TTL.PRICING_PLANS);
  }

  async getCachedPricingPlans(): Promise<any[] | null> {
    return this.get<any[]>('pricing:plans');
  }

  // Analytics caching
  async cacheAnalytics(key: string, data: Record<string, any>): Promise<void> {
    if (!key) {
      throw new Error('Analytics key is required');
    }
    await this.set(`analytics:${key}`, data, CACHE_TTL.ANALYTICS);
  }

  async getCachedAnalytics(key: string): Promise<Record<string, any> | null> {
    if (!key) {
      throw new Error('Analytics key is required');
    }
    return this.get<Record<string, any>>(`analytics:${key}`);
  }

  // Health check
  async healthCheck(): Promise<HealthCheck> {
    const health: HealthCheck = {
      redis: false,
      memory: true
    };

    try {
      if (this.redis) {
        const result = await Promise.race([
          this.redis.ping(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Redis ping timeout')), 5000)
          )
        ]);
        health.redis = result === 'PONG';
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
      health.redis = false;
    }

    return health;
  }

  // Get cache statistics
  getCacheStats(): { memoryEntries: number; memorySize: number } {
    return {
      memoryEntries: this.memoryCache.size,
      memorySize: JSON.stringify([...this.memoryCache.entries()]).length
    };
  }

  // Cleanup and close connections
  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
      this.redis = null;
    }

    this.memoryCache.clear();
    console.log('Cache service closed successfully');
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Cache middleware for Express
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `request:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(key);
      if (cached) {
        res.json(cached);
        return;
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        // Cache successful responses
        if (res.statusCode === 200 && data) {
          cacheService.set(key, data, ttl).catch(error => {
            console.error('Failed to cache response:', error);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Graceful shutdown handler
process.on('SIGTERM', () => {
  cacheService.close().catch(console.error);
});

process.on('SIGINT', () => {
  cacheService.close().catch(console.error);
});

export default cacheService;
export { CacheService, CACHE_TTL };
export type { Template, Project, GenerationResult, HealthCheck };
