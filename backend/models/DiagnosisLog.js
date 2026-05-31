import mongoose from 'mongoose';

const diagnosisLogSchema = new mongoose.Schema({
  symptoms:   { type: String, required: true },
  age:        { type: Number },
  gender:     { type: String },
  history:    { type: String },
  aiResponse: { type: mongoose.Schema.Types.Mixed },
  riskLevel:  { type: String, enum: ['low','medium','high'] },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('DiagnosisLog', diagnosisLogSchema);