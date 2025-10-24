import { z } from 'zod';

// Define the schema for environment variables
const baseSchema = z.object({
  // Server configuration
  PORT: z.string().optional().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  
  // Database configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  // During development allow either service role or anon key
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  
  // JWT configuration (relaxed in dev)
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  
  // OpenAI configuration (optional in dev)
  OPENAI_API_KEY: z.string().optional(),
    
  // Stripe configuration (optional in dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_BASIC_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),
  STRIPE_ENABLED: z.string().optional(),
  
  // Optional development settings
  AUTH_BYPASS: z.string().optional().transform(val => val === 'true'),
  FRONTEND_URL: z.string().url().optional().default('http://localhost:5173'),
});

const prodSchema = baseSchema.superRefine((vals, ctx) => {
  // In production enforce strict requirements
  if (!vals.JWT_SECRET || vals.JWT_SECRET.length < 32) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_SECRET'], message: 'JWT_SECRET must be set and >= 32 chars in production' });
  }
  if (!vals.JWT_REFRESH_SECRET || vals.JWT_REFRESH_SECRET.length < 32) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_REFRESH_SECRET'], message: 'JWT_REFRESH_SECRET must be set and >= 32 chars in production' });
  }
  if (!vals.OPENAI_API_KEY) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['OPENAI_API_KEY'], message: 'OPENAI_API_KEY is required in production' });
  }
  if (!vals.STRIPE_SECRET_KEY) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['STRIPE_SECRET_KEY'], message: 'STRIPE_SECRET_KEY is required in production' });
  }
  if (!vals.STRIPE_WEBHOOK_SECRET) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['STRIPE_WEBHOOK_SECRET'], message: 'STRIPE_WEBHOOK_SECRET is required in production' });
  }
  if (!vals.SUPABASE_SERVICE_ROLE_KEY) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['SUPABASE_SERVICE_ROLE_KEY'], message: 'SUPABASE_SERVICE_ROLE_KEY is required in production' });
  }
});

const devSchema = baseSchema.superRefine((vals, ctx) => {
  // In dev, require at least anon key
  if (!vals.SUPABASE_ANON_KEY && !vals.SUPABASE_SERVICE_ROLE_KEY) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['SUPABASE_ANON_KEY'], message: 'Provide SUPABASE_ANON_KEY (or SERVICE_ROLE) for development' });
  }
});

export type Env = z.infer<typeof baseSchema>;

// Validate environment variables
export function validateEnv(): Env {
  try {
    const parsed = baseSchema.parse(process.env);
    const isProd = parsed.NODE_ENV === 'production';
    if (isProd) {
      prodSchema.parse(process.env);
    } else {
      devSchema.parse(process.env);
    }
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Check your .env file and ensure all required variables are set.');
      console.error('📖 See SETUP.md for environment variable requirements.\n');
    }
    process.exit(1);
  }
}

// Load and validate environment
export const env = validateEnv();
