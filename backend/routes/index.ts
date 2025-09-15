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
import { 
  validateRequest, 
  generateSiteSchema, 
  saveProjectSchema, 
  getUserProjectsSchema, 
  getProjectSchema 
} from '../middleware/validation';

const router = Router();

// Auth routes (public)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Preview routes (public - but with preview ID as security)
router.get('/preview/:previewId', getPreview);

// Webhook routes (public - but verified with signature)
router.post('/webhook/stripe', handleStripeWebhook);

// Payment routes (public for pricing, protected for creating payments)
router.get('/pricing', getPricingPlans);
router.post('/create-payment', authenticateToken, createPayment);
router.post('/create-subscription', authenticateToken, createSubscriptionPayment);
router.get('/user-credits', authenticateToken, getUserCredits);

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
router.delete('/preview/:previewId', authenticateToken, deletePreview);

export default router;
