import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db, Profile, ProviderProfile } from '../db/supabase.js';
import { env } from '../config/env.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['customer', 'provider', 'admin'], {
    errorMap: () => ({ message: 'Role must be either customer or provider' }),
  }),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const adminCreateUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['customer', 'provider', 'admin']),
});

// Helper: strip password_hash from profile before returning to client
const sanitizeUser = (profile: Profile) => {
  const { password_hash, ...safeUser } = profile;
  return safeUser;
};

// Helper: sign JWT token
export const generateToken = (profile: Profile): string => {
  return jwt.sign(
    {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/v1/auth/register
// Customers and Providers can register. Admin registration is strictly forbidden.
router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid registration details',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const { full_name, email, phone, password, role } = parsed.data;

  // RULE: Never allow users to register themselves as Admin
  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN_ROLE',
        message: 'Security Violation: Administrator accounts cannot be registered publicly. They must be provisioned by an authorized administrator.',
      },
    });
  }

  // Check if email already registered
  const existing = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists. Please log in.',
      },
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUserId = `u-${Date.now()}`;
  const newProfile: Profile = {
    id: newUserId,
    email: email.toLowerCase(),
    full_name,
    phone,
    role,
    password_hash: passwordHash,
    avatar_url: `https://images.unsplash.com/photo-${role === 'provider' ? '1507003211169-0a1dd7228f2d' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=200&h=200&q=80`,
    created_at: new Date().toISOString(),
  };

  db.profiles.push(newProfile);

  // If registering as a provider, create initial provider profile
  if (role === 'provider') {
    const newProvider: ProviderProfile = {
      id: newUserId,
      full_name,
      email: email.toLowerCase(),
      phone,
      business_name: full_name,
      bio: 'Newly registered independent service professional on FixNear.',
      experience_years: 1,
      service_radius_km: 15.0,
      base_latitude: 12.9716,
      base_longitude: 77.5946,
      verification_status: 'pending',
      is_available: true,
      rating_avg: 5.0,
      rating_count: 0,
      total_completed_jobs: 0,
      commission_rate_percent: 15.0,
    };
    db.providerProfiles.push(newProvider);
  }

  // Sign JWT
  const token = generateToken(newProfile);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: sanitizeUser(newProfile),
  });
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please provide both email and password',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const { email, password } = parsed.data;

  // Find profile
  const profile = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (!profile) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  // Verify password hash
  let isMatch = false;
  if (profile.password_hash) {
    isMatch = await bcrypt.compare(password, profile.password_hash);
  } else {
    // If no hash set (legacy fallback), check default demo password
    isMatch = password === 'Password@123';
  }

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  // Sign JWT
  const token = generateToken(profile);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: sanitizeUser(profile),
  });
});

// GET /api/v1/auth/me
// Returns the authenticated user profile based on Bearer token
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    user: sanitizeUser(req.user!),
  });
});

// POST /api/v1/auth/admin/create-user
// Only authorized administrators can create another Admin or custom user
router.post('/admin/create-user', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const parsed = adminCreateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { full_name, email, phone, password, role } = parsed.data;

  const existing = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'User with this email already exists' },
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newProfile: Profile = {
    id: `admin-created-${Date.now()}`,
    email: email.toLowerCase(),
    full_name,
    phone,
    role,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  db.profiles.push(newProfile);

  // Log in admin audit trail
  db.auditLogs.push({
    id: `log-${Date.now()}`,
    admin_id: req.user!.id,
    action: 'CREATE_USER',
    target_table: 'profiles',
    target_id: newProfile.id,
    details: { role, email: newProfile.email, created_by: req.user!.email },
    created_at: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: `Account with role '${role}' provisioned successfully by Admin`,
    user: sanitizeUser(newProfile),
  });
});

export default router;
