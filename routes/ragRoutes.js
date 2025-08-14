import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, uploadAndIndex, ask } from '../controllers/ragController.js';

const router = Router();

router.post('/upload', authenticate, uploadMiddleware, uploadAndIndex);
router.post('/ask', authenticate, ask);

export default router;


