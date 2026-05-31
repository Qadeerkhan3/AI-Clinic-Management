import express from 'express';
import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
  generatePrescriptionPDF,
} from '../controllers/prescription.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('doctor'), createPrescription);
router.get('/patient/:patientId', authorize('admin', 'doctor', 'receptionist', 'patient'), getPatientPrescriptions);
router.get('/:id', authorize('admin', 'doctor', 'patient'), getPrescriptionById);
router.get('/:id/pdf', protect, generatePrescriptionPDF);

export default router;