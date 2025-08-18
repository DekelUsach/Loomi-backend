import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, uploadAndIndex, ask, getProgress, generateQuiz, getMyForms } from '../controllers/ragController.js';

const router = Router();

router.post('/upload', authenticate, uploadMiddleware, uploadAndIndex);
router.post('/ask', authenticate, ask);
router.get('/progress/:id', authenticate, getProgress);
router.post('/quiz', authenticate, generateQuiz);
router.get('/my-forms', authenticate, getMyForms);

export default router;


