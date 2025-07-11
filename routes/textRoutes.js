import { Router } from 'express';
import { getLoadedTextsById, getAllLoadedParagraphsByIdText } from '../controllers/textController.js';

const router = Router();

router.get('/loaded/texts/:id', getLoadedTextsById);
router.get('/loaded/paragraphs/:id', getAllLoadedParagraphsByIdText);

export default router;