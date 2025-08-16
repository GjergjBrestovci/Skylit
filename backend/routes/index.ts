import { Router } from 'express';
import { generateSite } from '../controllers/generateSite';
import { saveProject } from '../controllers/saveProject';
import { getProjects } from '../controllers/getProjects';
import { register, login } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Auth routes (public)
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/generate-site', authenticateToken, generateSite);
router.post('/save-project', authenticateToken, saveProject);
router.get('/get-projects', authenticateToken, getProjects);

export default router;
