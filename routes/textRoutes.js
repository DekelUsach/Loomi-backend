import { Router } from 'express';
import { getAllUserTextsByUserId, getAllUserParagraphsByIdText, insertUserText, getLoadedTextsById, getAllLoadedParagraphsByIdText } from '../controllers/textController.js';

const router = Router();

/* Userloaded */
router.get('/userloaded/texts/:id', getAllUserTextsByUserId)
router.get('/userloaded/paragraphs/:id', getAllUserParagraphsByIdText)
router.get('/userloaded/insert/:id', insertUserText)

/* Preloaded */
router.get('/preloaded/texts/:id', getLoadedTextsById);
router.get('/preloaded/paragraphs/:id', getAllLoadedParagraphsByIdText);

export default router;