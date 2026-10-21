import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route handlers
import servicesRouter from './routes/services.js';
import bookingsRouter from './routes/bookings.js';
import paymentsRouter from './routes/payments.js';
import providersRouter from './routes/providers.js';
import reviewsRouter from './routes/reviews.js';
import notificationsRouter from './routes/notifications.js';
import adminRouter from './routes/admin.js';
import aiRouter from './routes/ai.js';

const app = express();

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false, // allow loading Leaflet OSM tiles & Razorpay script
}));

app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter on API routes (100 requests per 15 min per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } },
});
app.use('/api', apiLimiter);

// Auth context extractor
app.use(authenticate);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'FixNear Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Mount API v1 routes
const v1 = express.Router();
v1.use('/', servicesRouter);
v1.use('/bookings', bookingsRouter);
v1.use('/payments', paymentsRouter);
v1.use('/providers', providersRouter);
v1.use('/reviews', reviewsRouter);
v1.use('/notifications', notificationsRouter);
v1.use('/admin', adminRouter);
v1.use('/ai', aiRouter);

app.use(env.API_PREFIX, v1);

// Centralized error handling
app.use(errorHandler);

// Only listen if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(` FixNear Server running on http://localhost:${env.PORT}`);
    console.log(` REST API Base: http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.log(` Health Check: http://localhost:${env.PORT}/health`);
  });
}

export default app;
