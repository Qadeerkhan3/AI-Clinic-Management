import Appointment from '../models/Appointment.js';
import Patient     from '../models/Patient.js';

export const getAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'doctor') {
      // Doctor sirf apni appointments dekhe
      filter.doctorId = req.user._id;

    } else if (req.user.role === 'patient') {
      // Patient apni appointments dhundho via email
      const patient = await Patient.findOne({ email: req.user.email });
      if (!patient) return res.json({ success: true, appointments: [] });
      filter.patientId = patient._id;

    } else if (req.user.role === 'receptionist') {
      // Receptionist sab dekhe — no filter
    }
    // Admin ko bhi sab dikhta hai — no filter

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId',  'name email')
      .sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot, notes } = req.body;

    // Empty string check — pehle validate karo
    if (!patientId || patientId === '') {
      return res.status(400).json({
        message: 'Patient ID missing hai — pehle patient profile complete karein'
      });
    }
    if (!doctorId || doctorId === '') {
      return res.status(400).json({ message: 'Doctor select karein' });
    }
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date aur time slot zaroor hai' });
    }

    // Conflict check
    const conflict = await Appointment.findOne({
      doctorId,
      date:   new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (conflict) {
      return res.status(400).json({ message: 'Yeh slot already booked hai' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date:     new Date(date),
      timeSlot,
      notes:    notes || '',
      bookedBy: req.user._id,
      status:   'pending',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId',  'name email');

    res.status(201).json({ success: true, appointment: populated });
  } catch (err) {
    console.error('bookAppointment error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Status galat hai' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patientId', 'name').populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment nahi mili' });
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDoctorSchedule = async (req, res) => {
  try {
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule = await Appointment.find({
      doctorId: req.user._id,
      date:     { $gte: today, $lt: tomorrow },
      status:   { $ne: 'cancelled' },
    }).populate('patientId', 'name age gender contact');

    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};