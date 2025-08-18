import { Router } from 'express';
import { getEnergy } from '../controllers/energyController.js';

const router = Router();

router.get('/:user_id', getEnergy)

export default router;