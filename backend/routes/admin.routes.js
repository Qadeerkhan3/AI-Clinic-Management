import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import User from '../models/User.js';

const router = express.Router();

// Admin-only access on all routes below
router.use(protect, authorize('admin'));

// ==================== DOCTORS ====================

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new doctor
router.post('/doctors', async (req, res) => {
  try {
    const { name, email, password, subscriptionPlan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Pass raw password — User model pre('save') hook handles hashing
    const doctor = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      subscriptionPlan: subscriptionPlan || 'free',
    });

    res.status(201).json({ success: true, doctor: doctor.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update doctor
router.put('/doctors/:id', async (req, res) => {
  try {
    const { name, email, isActive, subscriptionPlan } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name !== undefined)             updateData.name             = name;
    if (email !== undefined)            updateData.email            = email;
    if (isActive !== undefined)         updateData.isActive         = isActive;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;

    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete doctor
router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== RECEPTIONISTS ====================

// Get all receptionists
router.get('/receptionists', async (req, res) => {
  try {
    const receptionists = await User.find({ role: 'receptionist' }).select('-password');
    res.json({ success: true, receptionists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new receptionist
router.post('/receptionists', async (req, res) => {
  try {
    const { name, email, password, subscriptionPlan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Pass raw password — User model pre('save') hook handles hashing
    const receptionist = await User.create({
      name,
      email,
      password,
      role: 'receptionist',
      subscriptionPlan: subscriptionPlan || 'free',
    });

    res.status(201).json({ success: true, receptionist: receptionist.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update receptionist
router.put('/receptionists/:id', async (req, res) => {
  try {
    const { name, email, isActive, subscriptionPlan } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name !== undefined)             updateData.name             = name;
    if (email !== undefined)            updateData.email            = email;
    if (isActive !== undefined)         updateData.isActive         = isActive;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;

    const receptionist = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!receptionist) {
      return res.status(404).json({ success: false, message: 'Receptionist not found' });
    }

    res.json({ success: true, receptionist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete receptionist
router.delete('/receptionists/:id', async (req, res) => {
  try {
    const receptionist = await User.findByIdAndDelete(req.params.id);
    if (!receptionist) {
      return res.status(404).json({ success: false, message: 'Receptionist not found' });
    }
    res.json({ success: true, message: 'Receptionist deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;