import express from 'express';
import { symptomChecker, prescriptionExplain } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { requirePro } from '../middleware/subscription.middleware.js';
const router = express.Router();

router.use(protect);

router.post('/symptom-check',       authorize('doctor'),           symptomChecker);
router.post('/prescription-explain', authorize('doctor','patient'), prescriptionExplain);
router.post('/symptom-check',        protect, requirePro, authorize('doctor'), symptomChecker);
router.post('/prescription-explain', protect, requirePro, authorize('doctor','patient'), prescriptionExplain);

export default router;