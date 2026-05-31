import express from 'express';
import {
  getAppointments,
  bookAppointment,
  updateStatus,
  getDoctorSchedule,
} from '../controllers/appointment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Doctor schedule — specific route pehle
router.get(
  '/schedule',
  authorize('doctor'),
  getDoctorSchedule
);

// Sab appointments — admin, doctor, receptionist, patient sab dekh saken
router.get(
  '/',
  authorize('admin', 'doctor', 'receptionist', 'patient'),
  getAppointments
);

// Book appointment
router.post(
  '/',
  authorize('admin', 'receptionist', 'patient'),
  bookAppointment
);

// Status update
router.put(
  '/:id/status',
  authorize('admin', 'doctor', 'receptionist'),
  updateStatus
);

export default router;