import { Router } from 'express';
import { generateSite } from '../controllers/generateSite';
import { saveProject } from '../controllers/saveProject';
import { getProjects } from '../controllers/getProjects';

const router = Router();

router.post('/generate-site', generateSite);
router.post('/save-project', saveProject);
router.get('/get-projects', getProjects);

export default router;
