import { Router } from 'express';
import { getAllUsers, getUserById, createUser, loginUser } from '../controllers/userController.js';
import { getProfile } from '../controllers/profileController.jsx'

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', loginUser); // <--- agregá esto
router.get('/profile', getProfile);



export default router;
