import express from 'express';
import { getAdminStats, getDoctorStats } from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin',  authorize('admin'),           getAdminStats);
router.get('/doctor', authorize('doctor', 'admin'),  getDoctorStats);

export default router;