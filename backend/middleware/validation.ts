import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Strip dangerous HTML/script patterns from user-provided strings.
 * Prevents stored XSS if values are ever rendered in HTML context.
 */
function sanitizeString(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// Request validation middleware
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate URL parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: error.errors.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
            value: (err as any).input
          }))
        });
      }
      
      return res.status(400).json({
        error: 'Request validation failed'
      });
    }
  };
};

// Common validation schemas
export const generateSiteSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters long')
    .max(2000, 'Prompt cannot exceed 2000 characters')
    .transform(sanitizeString)
    .refine((prompt: string) => prompt.trim().length > 0, 'Prompt cannot be empty'),

  // Accept either a simple string (e.g., 'vanilla', 'react') or a detailed object
  techStack: z.union([
    z.string().min(1),
    z.object({
      framework: z.string().min(1),
      styling: z.string().optional(),
      features: z.array(z.string()).optional()
    })
  ]).optional(),

  // Options are optional and flexible
  options: z.record(z.any()).optional()
});

export const saveProjectSchema = z.object({
  // Title is required (can also be sent as 'name' for backwards compatibility)
  title: z.string()
    .min(1, 'Project title is required')
    .max(100, 'Project title cannot exceed 100 characters')
    .transform(sanitizeString)
    .optional(),

  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name cannot exceed 100 characters')
    .transform(sanitizeString)
    .optional(),

  // Original prompt
  prompt: z.string().max(10000).transform(sanitizeString).optional(),
  
  // Enhanced prompt from AI
  enhanced_prompt: z.string().max(50000).optional(),
  
  // Preview URLs - allow any string since it might be a relative path
  preview_url: z.string().max(500).optional().nullable(),
  preview_id: z.string().max(100).optional().nullable(),
  
  // Tech stack and type
  tech_stack: z.string().max(50).optional(),
  website_type: z.string().max(50).optional().nullable(),
  
  // Model used for generation
  model: z.string().max(100).optional().nullable(),
  
  // Generated code (JSON string or object)
  generated_code: z.union([
    z.string(),
    z.object({
      html: z.string().optional(),
      css: z.string().optional(),
      javascript: z.string().optional(),
      config: z.any().optional(),
      enhancedPrompt: z.string().optional(),
      analysis: z.string().optional(),
      requirements: z.array(z.string()).optional(),
      notes: z.string().optional(),
      model: z.string().optional(),
      previewUrl: z.string().optional(),
      enhancementUsedAI: z.boolean().optional()
    })
  ]).optional(),

  // Legacy fields for backwards compatibility
  description: z.string().max(500).optional(),
  code: z.object({
    html: z.string().optional(),
    css: z.string().optional(),
    js: z.string().optional()
  }).optional(),
  metadata: z.object({
    prompt: z.string().optional(),
    techStack: z.any().optional(),
    generatedAt: z.string().optional()
  }).optional()
}).refine(
  (data) => data.title || data.name,
  { message: 'Either title or name is required', path: ['title'] }
);

export const getUserProjectsSchema = z.object({
  page: z.string()
    .optional()
    .transform((val: string | undefined) => val ? parseInt(val) : 1)
    .refine((val: number) => val > 0, 'Page must be a positive number'),
    
  limit: z.string()
    .optional()
    .transform((val: string | undefined) => val ? parseInt(val) : 10)
    .refine((val: number) => val > 0 && val <= 50, 'Limit must be between 1 and 50'),
    
  search: z.string()
    .optional()
    .transform((val: string | undefined) => val?.trim() || undefined)
});

export const getProjectSchema = z.object({
  projectId: z.string()
    .uuid('Project ID must be a valid UUID')
});

export const enhancePromptSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(500, 'Prompt cannot exceed 500 characters')
    .transform(sanitizeString),
    
  context: z.object({
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    websiteType: z.string().optional(),
    additionalFeatures: z.array(z.string()).optional()
  }).optional()
});

export const updateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name cannot exceed 100 characters')
    .transform(sanitizeString)
    .optional(),

  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .transform(sanitizeString)
    .optional(),
    
  starred: z.boolean().optional(),
  archived: z.boolean().optional()
});

export const duplicateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name cannot exceed 100 characters')
    .optional()
});

export const templateCustomizationSchema = z.object({
  companyName: z.string().max(100).optional(),
  industry: z.string().max(50).optional(),
  colorScheme: z.string().max(30).optional(),
  additionalFeatures: z.array(z.string().max(50)).max(10).optional()
});

export const getTemplatesQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  search: z.string().max(100).optional()
});

export const getSamplePromptsQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional()
});

export const setSecretKeySchema = z.object({
  secretKey: z.string()
    .min(1, 'Secret key is required')
    .max(255, 'Secret key is too long')
});

export const updateSettingsSchema = z.object({
  displayName: z.string().max(80, 'Display name cannot exceed 80 characters').optional().nullable(),
  themePreference: z.enum(['system', 'dark', 'light']).optional(),
  notifications: z.object({
    productUpdates: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
    aiLaunches: z.boolean().optional()
  }).optional(),
  workspace: z.object({
    autosaveInterval: z.number().int().min(1, 'Autosave must be at least 1 minute').max(60, 'Autosave cannot exceed 60 minutes').optional(),
    showBetaFeatures: z.boolean().optional()
  }).optional(),
  integrations: z.object({
    apiMirroringEnabled: z.boolean().optional(),
    webhookUrl: z.string().url('Webhook URL must be valid').max(255).optional().nullable()
  }).optional()
});
