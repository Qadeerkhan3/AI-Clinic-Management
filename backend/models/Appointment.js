import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  bookedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:      { type: Date, required: true },
  timeSlot:  { type: String, required: true }, // e.g. "10:00 AM"
  status:    { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  notes:     { type: String },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);