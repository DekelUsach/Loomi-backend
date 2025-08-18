import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, uploadAndIndex, ask, getProgress, generateQuiz } from '../controllers/ragController.js';

const router = Router();

router.post('/upload', authenticate, uploadMiddleware, uploadAndIndex);
router.post('/ask', authenticate, ask);
router.get('/progress/:id', authenticate, getProgress);
router.post('/quiz', authenticate, generateQuiz);

export default router;


