import { Router } from 'express';
import { generateSite } from '../controllers/generateSite';
import { saveProject } from '../controllers/saveProject';
import { getProjects } from '../controllers/getProjects';
import { register, login, refreshToken } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { getPreview, deletePreview } from '../controllers/previewSite';

const router = Router();

// Auth routes (public)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Preview routes (public - but with preview ID as security)
router.get('/preview/:previewId', getPreview);

// Protected routes
router.post('/generate-site', authenticateToken, generateSite);
router.post('/save-project', authenticateToken, saveProject);
router.get('/get-projects', authenticateToken, getProjects);
router.delete('/preview/:previewId', authenticateToken, deletePreview);

export default router;
