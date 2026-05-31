import express from 'express';
import mongoose from 'mongoose';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';
import dotenv  from 'dotenv';

import authRoutes         from './routes/auth.routes.js';
import patientRoutes      from './routes/patient.routes.js';
import appointmentRoutes  from './routes/appointment.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import aiRoutes           from './routes/ai.routes.js';
import analyticsRoutes    from './routes/analytics.routes.js';
import adminRouter        from './routes/admin.routes.js';

dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production on Vercel allow all *.vercel.app origins
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

// ── MongoDB — serverless-safe connection caching ──────────────────────────────
let dbConnectionPromise = null;

const connectDB = () => {
  if (dbConnectionPromise) return dbConnectionPromise;

  dbConnectionPromise = mongoose
    .connect(process.env.MONGO_URI, { bufferCommands: false })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
      console.error('❌ DB connection error:', err.message);
      dbConnectionPromise = null; // reset so the next request retries
      throw err;
    });

  return dbConnectionPromise;
};

// Ensure DB is connected before every request
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/admin',         adminRouter);

app.get('/api/health', (_req, res) =>
  res.json({
    status:    'OK',
    db:        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Local development server (not used on Vercel) ────────────────────────────
if (!process.env.VERCEL) {
  connectDB()
    .then(() =>
      app.listen(process.env.PORT || 5000, () =>
        console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
      )
    )
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

export default app;