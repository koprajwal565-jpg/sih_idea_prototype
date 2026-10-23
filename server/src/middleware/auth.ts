import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, db, Profile } from '../db/supabase.js';
import { env } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: Profile;
}

interface JwtPayload {
  id: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  full_name?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const demoUserId = req.headers['x-demo-user-id'] as string | undefined;

    // 1. Verify standard Bearer JWT Token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // A. Check if it's a signed JWT from FixNear Auth
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        if (decoded && decoded.id) {
          const profile = db.profiles.find((p) => p.id === decoded.id);
          if (profile) {
            req.user = profile;
            return next();
          }
        }
      } catch {
        // Not a standard FixNear JWT, continue to other checks
      }

      // B. If Supabase is connected, verify with Supabase Auth
      if (supabase) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            const profile = db.profiles.find((p) => p.id === user.id) || {
              id: user.id,
              email: user.email || 'user@example.com',
              full_name: user.user_metadata?.full_name || 'FixNear User',
              phone: user.phone || '',
              role: (user.user_metadata?.role as any) || 'customer',
              created_at: user.created_at,
            };
            req.user = profile;
            return next();
          }
        } catch {
          // ignore supabase error
        }
      }

      // C. Backward compatibility check: check if token matches a profile ID directly
      const devProfile = db.profiles.find((p) => p.id === token);
      if (devProfile) {
        req.user = devProfile;
        return next();
      }
    }

    // 2. Check for demo user header (useful for automated testing)
    if (demoUserId) {
      const profile = db.profiles.find((p) => p.id === demoUserId);
      if (profile) {
        req.user = profile;
        return next();
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in with valid credentials.',
      },
    });
  }
  next();
};

export const requireRole = (allowedRoles: ('customer' | 'provider' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Your role is '${req.user.role}'.`,
        },
      });
    }

    next();
  };
};
