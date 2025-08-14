import { Router } from 'express';
import { getEnergy, getGems } from '../controllers/energyAndGemsController.js';

const router = Router();

/* Energy */
router.get('/:user_id', getEnergy)

/* Gems */
// NOTE: Frontend expects /gems/:user_id, so we also mount a top-level alias in index.js if needed
router.get('/gems/:user_id', getGems)

export default router;