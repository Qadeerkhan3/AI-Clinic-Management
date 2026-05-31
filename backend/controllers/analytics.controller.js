import User         from '../models/User.js';
import Patient      from '../models/Patient.js';
import Appointment  from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';

export const getAdminStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, monthlyAppointments] =
      await Promise.all([
        Patient.countDocuments(),
        User.countDocuments({ role: 'doctor' }),
        Appointment.countDocuments(),
        Appointment.aggregate([
          { $group: { _id: { $month: '$date' }, count: { $sum: 1 } } },
          { $sort:  { _id: 1 } },
        ]),
      ]);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        monthlyAppointments,
      },
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const [todayCount, monthCount, prescriptionCount] = await Promise.all([
      Appointment.countDocuments({
        doctorId,
        date: { $gte: todayStart, $lte: todayEnd },
      }),
      Appointment.countDocuments({
        doctorId,
        date: { $gte: monthStart },
      }),
      Prescription.countDocuments({ doctorId }),
    ]);

    res.json({
      success: true,
      stats: { todayCount, monthCount, prescriptionCount },
    });
  } catch (err) {
    console.error('getDoctorStats error:', err);
    res.status(500).json({ message: err.message });
  }
};