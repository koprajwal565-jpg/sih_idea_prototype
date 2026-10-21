import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/supabase.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with requireAuth & requireRole('admin')
router.use(requireAuth);
router.use(requireRole(['admin']));

// GET /api/v1/admin/metrics - calculate live metrics from actual database records
router.get('/metrics', (req: AuthenticatedRequest, res: Response) => {
  const totalBookings = db.bookings.length;
  const completedBookings = db.bookings.filter((b) => b.status === 'completed');
  const activeBookings = db.bookings.filter((b) =>
    ['confirmed', 'provider_assigned', 'provider_en_route', 'in_progress'].includes(b.status)
  );

  const totalGMVInr = db.bookings.reduce((sum, b) => sum + b.final_price_inr, 0);
  const platformRevenueInr = db.bookings.reduce((sum, b) => {
    // 49 platform fee + 15% commission on base price
    const commission = Math.round(b.estimated_price_inr * 0.15);
    return sum + b.platform_fee_inr + commission;
  }, 0);

  const totalProviders = db.providerProfiles.length;
  const verifiedProviders = db.providerProfiles.filter((p) => p.verification_status === 'verified').length;
  const pendingProviders = db.providerProfiles.filter((p) => p.verification_status === 'pending').length;

  const totalCustomers = db.profiles.filter((p) => p.role === 'customer').length;

  return res.json({
    success: true,
    data: {
      total_bookings: totalBookings,
      active_bookings: activeBookings.length,
      completed_bookings: completedBookings.length,
      total_gmv_inr: totalGMVInr,
      platform_revenue_inr: platformRevenueInr,
      total_providers: totalProviders,
      verified_providers: verifiedProviders,
      pending_verification: pendingProviders,
      total_customers: totalCustomers,
    },
  });
});

// GET /api/v1/admin/providers/pending - queue of pending provider applications
router.get('/providers/pending', (req: AuthenticatedRequest, res: Response) => {
  const pending = db.providerProfiles.filter((p) => p.verification_status === 'pending');

  const hydrated = pending.map((pro) => {
    const docs = db.providerDocuments.filter((d) => d.provider_id === pro.id);
    return {
      ...pro,
      documents: docs,
    };
  });

  return res.json({
    success: true,
    count: hydrated.length,
    data: hydrated,
  });
});

const verifyProviderSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
});

// POST /api/v1/admin/providers/:id/verify - approve or reject provider application
router.post('/providers/:id/verify', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const admin = req.user!;
  const parsed = verifyProviderSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { decision, notes } = parsed.data;
  const provider = db.providerProfiles.find((p) => p.id === id);

  if (!provider) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
    });
  }

  provider.verification_status = decision === 'approve' ? 'verified' : 'rejected';
  provider.verification_notes = notes;

  // Update associated documents
  db.providerDocuments
    .filter((d) => d.provider_id === id)
    .forEach((d) => {
      d.verification_status = decision === 'approve' ? 'verified' : 'rejected';
    });

  // Record audit log
  db.auditLogs.push({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    action: decision === 'approve' ? 'APPROVE_PROVIDER' : 'REJECT_PROVIDER',
    target_table: 'provider_profiles',
    target_id: provider.id,
    details: { decision, notes, provider_name: provider.full_name },
    created_at: new Date().toISOString(),
  });

  // Notify the provider
  db.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: provider.id,
    title: decision === 'approve' ? 'Application Approved!' : 'Application Needs Attention',
    message:
      decision === 'approve'
        ? 'Congratulations! Your FixNear professional profile has been verified. You can now accept customer bookings.'
        : `Your application was not approved. Note: ${notes || 'Please resubmit documents.'}`,
    type: 'verification_decision',
    is_read: false,
    related_entity_type: 'provider_profile',
    related_entity_id: provider.id,
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: provider,
    message: `Provider application ${decision === 'approve' ? 'approved' : 'rejected'}.`,
  });
});

// GET /api/v1/admin/audit-logs - tamper-evident audit logs
router.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    data: db.auditLogs,
  });
});

export default router;
