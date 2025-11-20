import { Router } from 'express';
import { generateSite } from '../controllers/generateSite';
import { saveProject } from '../controllers/saveProject';
import { getProjects } from '../controllers/getProjects';
import { getProject } from '../controllers/getProject';
import { register, login, refreshToken } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { getPreview, deletePreview } from '../controllers/previewSite';
import { getPricingPlans, createPayment, createSubscriptionPayment, getUserCredits } from '../controllers/payment';
import { handleStripeWebhook } from '../controllers/webhook';
import { updateProject, deleteProject, duplicateProject, getProjectHistory } from '../controllers/projectManagement';
import { getTemplateCategories, getTemplates, getTemplate, getSamplePrompts, generateFromTemplate } from '../controllers/templates';
import { setUserSecretKey } from '../controllers/secretKey';
import { fetchSettings, saveSettings } from '../controllers/userSettings';
import seoRoutes from './seo';
import { 
  validateRequest, 
  generateSiteSchema, 
  saveProjectSchema, 
  getUserProjectsSchema, 
  getProjectSchema,
  updateProjectSchema,
  duplicateProjectSchema,
  templateCustomizationSchema,
  getTemplatesQuerySchema,
  getSamplePromptsQuerySchema,
  setSecretKeySchema,
  updateSettingsSchema
} from '../middleware/validation';
import { supabase as supabaseClient } from '../supabase';

const router = Router();

// Health route
router.get('/health', async (_req, res) => {
  const supaUrl = process.env.SUPABASE_URL;
  const supaAnon = process.env.SUPABASE_ANON_KEY ? 'present' : 'missing';
  // Lightweight call that doesn't hit DB hard
  let authOk = false;
  try {
    // This will not validate a token, but ensures client is constructed
    authOk = !!supaUrl && supaAnon === 'present';
  } catch {
    authOk = false;
  }
  
  // Check database health
  const { getDatabaseStatus } = await import('../services/databaseHealth');
  const dbStatus = await getDatabaseStatus();
  
  res.json({ 
    ok: true, 
    supabase: { 
      url: supaUrl || null, 
      anonKey: supaAnon, 
      configured: authOk 
    }, 
    database: dbStatus,
    stripeEnabled: process.env.STRIPE_ENABLED !== 'false' 
  });
});

// SEO routes (public)
router.use('/', seoRoutes);

// Auth routes (public)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Preview routes (public - but with preview ID as security)
router.get('/preview/:previewId', getPreview);

// Webhook routes (public - but verified with signature) — only if Stripe enabled
if (process.env.STRIPE_ENABLED !== 'false') {
  router.post('/webhook/stripe', handleStripeWebhook);
}

// Template routes (public)
router.get('/templates/categories', getTemplateCategories);
router.get('/templates', validateRequest({ query: getTemplatesQuerySchema }), getTemplates);
router.get('/templates/:templateId', getTemplate);
router.get('/sample-prompts', validateRequest({ query: getSamplePromptsQuerySchema }), getSamplePrompts);
router.post('/templates/:templateId/generate', 
  authenticateToken, 
  validateRequest({ body: templateCustomizationSchema }), 
  generateFromTemplate
);

// Payment routes (public for pricing, protected for creating payments) — only if Stripe enabled
router.get('/pricing', getPricingPlans);
if (process.env.STRIPE_ENABLED !== 'false') {
  router.post('/create-payment', authenticateToken, createPayment);
  router.post('/create-subscription', authenticateToken, createSubscriptionPayment);
}
router.get('/user-credits', authenticateToken, getUserCredits);

// Secret key route for unlimited credits
router.post('/set-secret-key', 
  authenticateToken, 
  validateRequest({ body: setSecretKeySchema }), 
  setUserSecretKey
);

router.get('/user-settings', authenticateToken, fetchSettings);
router.put('/user-settings', 
  authenticateToken,
  validateRequest({ body: updateSettingsSchema }),
  saveSettings
);

// Protected routes
router.post('/generate-site', 
  authenticateToken, 
  validateRequest({ body: generateSiteSchema }), 
  generateSite
);
router.post('/save-project', 
  authenticateToken, 
  validateRequest({ body: saveProjectSchema }), 
  saveProject
);
router.get('/get-projects', 
  authenticateToken, 
  validateRequest({ query: getUserProjectsSchema }), 
  getProjects
);
router.get('/get-project/:projectId', 
  authenticateToken, 
  validateRequest({ params: getProjectSchema }), 
  getProject
);
router.put('/projects/:projectId', 
  authenticateToken, 
  validateRequest({ 
    params: getProjectSchema, 
    body: updateProjectSchema 
  }), 
  updateProject
);
router.delete('/projects/:projectId', 
  authenticateToken, 
  validateRequest({ params: getProjectSchema }), 
  deleteProject
);
router.post('/projects/:projectId/duplicate', 
  authenticateToken, 
  validateRequest({ 
    params: getProjectSchema,
    body: duplicateProjectSchema 
  }), 
  duplicateProject
);
router.get('/projects/:projectId/history', 
  authenticateToken, 
  validateRequest({ params: getProjectSchema }), 
  getProjectHistory
);
router.delete('/preview/:previewId', authenticateToken, deletePreview);

export default router;
