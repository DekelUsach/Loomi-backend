import { Router } from 'express';
import { getAllUserTextsByUserId, getAllUserParagraphsByIdText, insertUserText, getLoadedTextsById, getAllLoadedParagraphsByIdText, insertUserParagraphs } from '../controllers/textController.js';

const router = Router();

/* Userloaded */
router.get('/userloaded/texts/:id', getAllUserTextsByUserId)
router.get('/userloaded/paragraphs/:id', getAllUserParagraphsByIdText)
router.post('/userloaded/insert-text/', insertUserText)
router.post('/userloaded/insert-paragraphs/', insertUserParagraphs)

/* Preloaded */
router.get('/preloaded/texts/:id', getLoadedTextsById);
router.get('/preloaded/paragraphs/:id', getAllLoadedParagraphsByIdText);

export default router;