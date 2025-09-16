import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  
  code: z.object({
    html: z.string().min(1, 'HTML code is required'),
    css: z.string().optional().default(''),
    js: z.string().optional().default('')
  }),
  
  metadata: z.object({
    prompt: z.string(),
    techStack: z.object({
      framework: z.string(),
      styling: z.string(),
      features: z.array(z.string()).optional()
    }),
    generatedAt: z.string().datetime().optional()
  })
});

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
    .max(500, 'Prompt cannot exceed 500 characters'),
    
  context: z.object({
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    websiteType: z.string().optional(),
    additionalFeatures: z.array(z.string()).optional()
  }).optional()
});
