import { Router } from 'express';
import { getAllUserTextsByUserId, getAllUserParagraphsByIdText, insertUserText, getLoadedTextsById, getAllLoadedParagraphsByIdText, insertUserParagraphs, getAllPreloadedTexts, getMyPreloadedTexts, getMyUserLoadedTexts } from '../controllers/textController.js';

const router = Router();

/* Userloaded */
router.get('/userloaded/texts/:id', getAllUserTextsByUserId)
router.get('/userloaded/paragraphs/:id', getAllUserParagraphsByIdText)
router.post('/userloaded/insert-text/', insertUserText)
router.post('/userloaded/insert-paragraphs/', insertUserParagraphs)

/* Preloaded */
router.get('/preloaded/texts', getAllPreloadedTexts);
router.get('/preloaded/my-texts', getMyPreloadedTexts);
router.get('/preloaded/texts/:id', getLoadedTextsById);
router.get('/preloaded/paragraphs/:id', getAllLoadedParagraphsByIdText);

/* Mis userLoadedTexts (por usuario autenticado) */
router.get('/userloaded/my-texts', getMyUserLoadedTexts);

export default router;