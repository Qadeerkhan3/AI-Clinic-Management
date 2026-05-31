import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getMyProfile,
  updateMyProfile,
  getMyAppointments,
  getMyPrescriptions,
} from '../controllers/patient.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // sab routes protected

// ── Patient apne liye (role: patient) ──
router.get('/profile/me',       authorize('patient'), getMyProfile);
router.put('/profile',          authorize('patient'), updateMyProfile);
router.get('/my-appointments',  authorize('patient'), getMyAppointments);
router.get('/my-prescriptions', authorize('patient'), getMyPrescriptions);

// ── Staff routes ──
router.get('/',      authorize('admin','doctor','receptionist'), getAllPatients);
router.get('/:id',   authorize('admin','doctor','receptionist'), getPatientById);
router.post('/',     authorize('admin','receptionist'),          createPatient);
router.put('/:id',   authorize('admin','receptionist'),          updatePatient);
router.delete('/:id', authorize('admin'),                        deletePatient);

export default router;