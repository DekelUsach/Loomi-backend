import { Router } from 'express';
import { getGems } from '../controllers/gemsController.js';

const router = Router();

router.get('/:user_id', getGems)

export default router;