import { Router } from 'express';
import { getEnergy } from '../controllers/energyAndGemsController.js';

const router = Router();

/* Energy */
router.get('/:user_id', getEnergy)

/* Gems */

export default router;