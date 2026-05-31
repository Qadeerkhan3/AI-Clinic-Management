import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  age:        { type: Number, required: true },
  gender:     { type: String, enum: ['male', 'female', 'other'], required: true },
  contact:    { type: String, required: true },
  email:      { type: String, lowercase: true },
  address:    { type: String },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);