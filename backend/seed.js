import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import User     from './models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await User.deleteMany({});

await User.create([
  { name: 'Admin',       email: 'admin@clinic.com',     password: 'admin123',   role: 'admin',        isActive: true, subscriptionPlan: 'pro'  },
  { name: 'Dr. Ahmed',   email: 'doctor@clinic.com',    password: 'doctor123',  role: 'doctor',       isActive: true, subscriptionPlan: 'pro'  },
  { name: 'Receptionist',email: 'reception@clinic.com', password: 'rec123',     role: 'receptionist', isActive: true, subscriptionPlan: 'free' },
  { name: 'Patient Ali', email: 'patient@clinic.com',   password: 'patient123', role: 'patient',      isActive: true, subscriptionPlan: 'free' },
]);

console.log('✅ Users ready');
await mongoose.disconnect();