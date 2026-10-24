import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientDist = fs.existsSync(path.join(clientDistPath, 'index.html'));

import { env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route handlers
import authRouter from './routes/auth.js';
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

// Silence favicon 404s
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

// Apply rate limiter on API routes (300 requests per 15 min per IP)
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

// API information endpoint
app.get(['/api', '/api/v1'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'FixNear REST API is active and operational',
    version: '1.0.0',
    documentation: 'See docs/ARCHITECTURE.md',
    endpoints: {
      auth: `${env.API_PREFIX}/auth`,
      services: `${env.API_PREFIX}/services`,
      categories: `${env.API_PREFIX}/categories`,
      bookings: `${env.API_PREFIX}/bookings`,
      payments: `${env.API_PREFIX}/payments`,
      providers: `${env.API_PREFIX}/providers`,
      admin: `${env.API_PREFIX}/admin`,
      ai: `${env.API_PREFIX}/ai`,
      health: '/health',
    },
  });
});

// Mount API v1 routes
const v1 = express.Router();
v1.use('/auth', authRouter);
v1.use('/', servicesRouter);
v1.use('/bookings', bookingsRouter);
v1.use('/payments', paymentsRouter);
v1.use('/providers', providersRouter);
v1.use('/reviews', reviewsRouter);
v1.use('/notifications', notificationsRouter);
v1.use('/admin', adminRouter);
v1.use('/ai', aiRouter);

app.use(env.API_PREFIX, v1);

// Serve frontend if client/dist exists (Full-stack mode on single port)
if (hasClientDist) {
  app.use(express.static(clientDistPath));

  app.get('*', (req: Request, res: Response, next) => {
    // Pass API requests that didn't match to 404/errorHandler
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>FixNear API Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafaf9; color: #1c1917; padding: 48px; max-width: 680px; margin: 0 auto; }
            h1 { color: #047857; display: flex; align-items: center; gap: 8px; font-size: 28px; }
            .badge { display: inline-block; padding: 4px 10px; background: #d1fae5; color: #065f46; font-size: 13px; font-weight: 600; border-radius: 9999px; }
            ul { line-height: 1.8; margin-top: 16px; }
            a { color: #059669; text-decoration: none; font-weight: 500; }
            a:hover { text-decoration: underline; }
            .card { background: white; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>FixNear API Server <span class="badge">Online 🟢</span></h1>
            <p>The backend REST API is running and healthy.</p>
            <ul>
              <li><strong>Frontend Application:</strong> <a href="http://localhost:5173" target="_blank">http://localhost:5173 &rarr;</a></li>
              <li><strong>API Overview:</strong> <a href="/api">/api &rarr;</a></li>
              <li><strong>Health Check:</strong> <a href="/health">/health &rarr;</a></li>
              <li><strong>Services Endpoint:</strong> <a href="/api/v1/services">/api/v1/services &rarr;</a></li>
            </ul>
          </div>
        </body>
      </html>
    `);
  });
}

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
