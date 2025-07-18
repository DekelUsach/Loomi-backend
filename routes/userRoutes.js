// routes/userRoutes.js
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  getProfile
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/profile', getProfile);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', loginUser);
router.put('/:id', authenticate, updateUser);

export default router;
