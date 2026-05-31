import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { register, login, getMe, getDoctors } from '../controllers/auth.controller.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/doctors', protect, getDoctors);

export default router;