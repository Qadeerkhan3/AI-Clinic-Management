import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String, required: true }, // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "2x daily"
  duration:  { type: String, required: true }, // e.g. "7 days"
  notes:     { type: String },
});

const prescriptionSchema = new mongoose.Schema({
  patientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  medicines:    [medicineSchema],
  diagnosis:    { type: String, required: true },
  instructions: { type: String },
  followUpDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);