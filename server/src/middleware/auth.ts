import { Request, Response, NextFunction } from 'express';
import { supabase, db, Profile } from '../db/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: Profile;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const demoUserId = req.headers['x-demo-user-id'] as string | undefined;

    // 1. Check for demo user header (very useful for local development & manual role testing)
    if (demoUserId) {
      const profile = db.profiles.find((p) => p.id === demoUserId);
      if (profile) {
        req.user = profile;
        return next();
      }
    }

    // 2. Check for Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // If Supabase is connected, verify with Supabase Auth
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          // Look up user profile
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
      }

      // Check if token matches a profile ID directly (dev convenience)
      const devProfile = db.profiles.find((p) => p.id === token);
      if (devProfile) {
        req.user = devProfile;
        return next();
      }
    }

    // Default to the first customer profile in local dev mode if no header is supplied
    // but don't strictly enforce if route isn't protected with requireAuth
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
    // In local dev without headers, default to Rahul Sharma (customer) for seamless testing
    req.user = db.profiles[0];
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
          message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        },
      });
    }

    next();
  };
};
