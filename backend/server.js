import express    from 'express';
import mongoose   from 'mongoose';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import dotenv     from 'dotenv';
import jwt        from 'jsonwebtoken';

import authRoutes         from './routes/auth.routes.js';
import patientRoutes      from './routes/patient.routes.js';
import appointmentRoutes  from './routes/appointment.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import aiRoutes           from './routes/ai.routes.js';
import analyticsRoutes    from './routes/analytics.routes.js';
import adminRouter        from './routes/admin.routes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/admin',         adminRouter);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Debug route — token check karne ke liye
app.get('/api/debug/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ error: 'No token found' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, decoded });
  } catch (err) {
    res.json({ error: err.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('❌ DB Error:', err));