import Redis from 'ioredis';

// Cache configuration
const CACHE_TTL = {
  TEMPLATES: 60 * 60, // 1 hour
  SAMPLE_PROMPTS: 60 * 30, // 30 minutes
  USER_PROJECTS: 60 * 15, // 15 minutes
  GENERATION_RESULT: 60 * 60 * 24, // 24 hours
  PRICING_PLANS: 60 * 60 * 2, // 2 hours
  ANALYTICS: 60 * 5, // 5 minutes
} as const;

class CacheService {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: any; expires: number }>();

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('error', (error) => {
          console.error('Redis connection error:', error);
          this.redis = null; // Fallback to memory cache
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
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
    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value);
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
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

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
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

      // Clean up expired memory cache entries periodically
      this.cleanupMemoryCache();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
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
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // Clear matching patterns from memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Cache pattern delete error:', error);
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, { expires }] of this.memoryCache.entries()) {
      if (expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Helper methods for specific cache operations
  async cacheTemplates(templates: any[]): Promise<void> {
    await this.set('templates:all', templates, CACHE_TTL.TEMPLATES);
  }

  async getCachedTemplates(): Promise<any[] | null> {
    return this.get('templates:all');
  }

  async cacheTemplate(templateId: string, template: any): Promise<void> {
    await this.set(`template:${templateId}`, template, CACHE_TTL.TEMPLATES);
  }

  async getCachedTemplate(templateId: string): Promise<any | null> {
    return this.get(`template:${templateId}`);
  }

  async cacheUserProjects(userId: string, projects: any[]): Promise<void> {
    await this.set(`user:${userId}:projects`, projects, CACHE_TTL.USER_PROJECTS);
  }

  async getCachedUserProjects(userId: string): Promise<any[] | null> {
    return this.get(`user:${userId}:projects`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}:*`);
  }

  async cacheGenerationResult(resultId: string, result: any): Promise<void> {
    await this.set(`generation:${resultId}`, result, CACHE_TTL.GENERATION_RESULT);
  }

  async getCachedGenerationResult(resultId: string): Promise<any | null> {
    return this.get(`generation:${resultId}`);
  }

  async cachePricingPlans(plans: any[]): Promise<void> {
    await this.set('pricing:plans', plans, CACHE_TTL.PRICING_PLANS);
  }

  async getCachedPricingPlans(): Promise<any[] | null> {
    return this.get('pricing:plans');
  }

  // Analytics caching
  async cacheAnalytics(key: string, data: any): Promise<void> {
    await this.set(`analytics:${key}`, data, CACHE_TTL.ANALYTICS);
  }

  async getCachedAnalytics(key: string): Promise<any | null> {
    return this.get(`analytics:${key}`);
  }

  // Health check
  async healthCheck(): Promise<{ redis: boolean; memory: boolean }> {
    const health = {
      redis: false,
      memory: true
    };

    try {
      if (this.redis) {
        await this.redis.ping();
        health.redis = true;
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    return health;
  }

  // Cleanup and close connections
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryCache.clear();
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Cache middleware for Express
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: any, res: any, next: any) => {
    const key = `request:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(key);
      if (cached) {
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache successful responses
        if (res.statusCode === 200) {
          cacheService.set(key, data, ttl).catch(console.error);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export default cacheService;
