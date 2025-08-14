// routes/userRoutes.js
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  postAvatar,
  updateUser,
  getProfile,
  deleteUser,
  loginWithGoogle,
  getGoogleClientConfig,
  loginWithGoogleCallback,
  setPassword
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
//nuevo asi que por ahi
router.get('/', getAllUsers);
router.get('/profile', getProfile);
// Google OAuth helpers BEFORE dynamic :id to avoid conflicts
router.get('/google-client-id', getGoogleClientConfig);
router.post('/google/callback', loginWithGoogleCallback);
router.post('/google', loginWithGoogle);

router.post('/', createUser);
router.post('/login', loginUser);
router.post('/avatar', postAvatar);
router.put('/:id', authenticate, updateUser);
router.get('/:id', getUserById);
router.delete('/me', deleteUser)
router.post('/password', authenticate, setPassword);
export default router;
