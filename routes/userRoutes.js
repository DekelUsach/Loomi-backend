// routes/userRoutes.js
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  getProfile,
  deleteUser
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
//nuevo asi que por ahi
router.get('/', getAllUsers);
router.get('/profile', getProfile);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', loginUser);
router.put('/:id', authenticate, updateUser);
router.delete('/me', deleteUser)
export default router;
