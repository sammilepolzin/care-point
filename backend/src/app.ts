import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { sendResponse } from './utils/apiResponse';
import authRoutes from './routes/auth.routes';
import departmentRoutes from './routes/department.routes';
import doctorRoutes from './routes/doctor.routes';
import uploadRoutes from './routes/upload.routes';
import testRoutes from './routes/test.routes';
import testCategoryRoutes from './routes/testCategory.routes';
import testBookingRoutes from './routes/testBooking.routes';
import reportRoutes from './routes/report.routes';
import prescriptionRoutes from './routes/prescription.routes';
import packageRoutes from './routes/package.routes';
import offerRoutes from './routes/offer.routes';
import contactMessageRoutes from './routes/contactMessage.routes';
import galleryRoutes from './routes/gallery.routes';
import settingsRoutes from './routes/settings.routes';
import doctorScheduleRoutes from './routes/doctorSchedule.routes';
import doctorAvailabilityRoutes from './routes/doctorAvailability.routes';
import serialBookingRoutes from './routes/serialBooking.routes';

const app: Application = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: false,
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use(cookieParser());

// Static Uploads
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// Health Check
app.get('/api/v1/health', (_req, res) => {
  sendResponse({
    res,
    message: 'Care Point Diagnostic API Server is running smoothly',
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Mounted Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/test-categories', testCategoryRoutes);
app.use('/api/v1/test-bookings', testBookingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/messages', contactMessageRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/doctor-schedules', doctorScheduleRoutes);
app.use('/api/v1/doctor-availability', doctorAvailabilityRoutes);
app.use('/api/v1/appointments', serialBookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;