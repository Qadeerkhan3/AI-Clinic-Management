import Patient      from '../models/Patient.js';
import Appointment  from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import User         from '../models/User.js';

// ─── Existing functions (yeh pehle se hain) ───────────────────────

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('createdBy', 'name');
    if (!patient) return res.status(404).json({ message: 'Patient nahi mila' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, contact, address, bloodGroup, email } = req.body;
    const patient = await Patient.create({
      name, age, gender, contact, address, bloodGroup, email,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient nahi mila' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Patient delete ho gaya' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── NEW: Patient apna profile dekhe ──────────────────────────────

export const getMyProfile = async (req, res) => {
  try {
    let patient = await Patient.findOne({ email: req.user.email });

    // Agar patient record nahi toh auto-create karo
    if (!patient) {
      patient = await Patient.create({
        name:      req.user.name,
        email:     req.user.email,
        age:       0,
        gender:    'male',
        contact:   '',
        createdBy: req.user._id,
      });
    }

    res.json({
      success: true,
      user: {
        _id:              req.user._id,
        name:             req.user.name,
        email:            req.user.email,
        role:             req.user.role,
        subscriptionPlan: req.user.subscriptionPlan,
      },
      patient,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── NEW: Patient apna profile update kare ────────────────────────

export const updateMyProfile = async (req, res) => {
  try {
    const { name, contact, age, gender, address, bloodGroup } = req.body;

    // User name update karo
    await User.findByIdAndUpdate(req.user._id, { name });

    // Patient record update ya create karo
    const patient = await Patient.findOneAndUpdate(
      { email: req.user.email },
      { name, contact, age, gender, address, bloodGroup, email: req.user.email },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── NEW: Patient apni appointments dekhe ─────────────────────────

export const getMyAppointments = async (req, res) => {
  try {
    // Pehle patient record dhundho
    const patient = await Patient.findOne({ email: req.user.email });

    if (!patient) {
      // Patient record nahi bana abhi tak — empty return karo
      return res.json({ success: true, appointments: [] });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name email')
      .sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── NEW: Patient apni prescriptions dekhe ────────────────────────

export const getMyPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email });

    if (!patient) {
      return res.json({ success: true, prescriptions: [] });
    }

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};