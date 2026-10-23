import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server or root directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  
  // Supabase
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholderKey'),
  RAZORPAY_KEY_SECRET: z.string().default('placeholderSecret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('placeholderWebhookSecret'),
  ENABLE_DEMO_PAYMENT_MODE: z.coerce.boolean().default(true),

  // Auth & JWT
  JWT_SECRET: z.string().default('fixnear-jwt-secret-key-2026-production-secure'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI
  GEMINI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gemini-1.5-flash'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
