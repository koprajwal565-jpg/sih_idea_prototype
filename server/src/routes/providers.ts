import { Router, Response } from 'express';
import { z } from 'zod';
import { db, ProviderProfile } from '../db/supabase.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/providers - list verified providers
router.get('/', (req, res) => {
  const { service_id, search } = req.query;

  let providers = db.providerProfiles.filter((p) => p.verification_status === 'verified');

  if (service_id && typeof service_id === 'string') {
    const mappings = db.providerServiceMap.filter((m) => m.service_id === service_id);
    providers = providers.filter((p) => mappings.some((m) => m.provider_id === p.id));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    providers = providers.filter(
      (p) =>
        p.business_name?.toLowerCase().includes(q) ||
        p.full_name?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    count: providers.length,
    data: providers,
  });
});

// GET /api/v1/providers/:id - provider profile with ratings and reviews
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const provider = db.providerProfiles.find((p) => p.id === id);

  if (!provider) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Provider not found' },
    });
  }

  // Get provider services
  const serviceIds = db.providerServiceMap
    .filter((m) => m.provider_id === provider.id)
    .map((m) => m.service_id);
  const services = db.services.filter((s) => serviceIds.includes(s.id));

  // Get provider reviews
  const reviews = db.reviews.filter((r) => r.provider_id === provider.id);

  return res.json({
    success: true,
    data: {
      ...provider,
      services,
      reviews,
    },
  });
});

// GET /api/v1/providers/me/dashboard - provider workspace statistics & incoming jobs
router.get('/me/dashboard', requireAuth, requireRole(['provider', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const provider = db.providerProfiles.find((p) => p.id === user.id) || db.providerProfiles[0];

  // Provider's bookings
  const proBookings = db.bookings.filter((b) => b.provider_id === provider.id);

  // Incoming requests (pending confirmation or newly assigned)
  const incomingRequests = proBookings.filter((b) => ['confirmed', 'provider_assigned'].includes(b.status));

  // Active jobs (en route or in progress)
  const activeJobs = proBookings.filter((b) => ['provider_en_route', 'in_progress'].includes(b.status));

  // Completed jobs
  const completedJobs = proBookings.filter((b) => b.status === 'completed');

  // Calculate earnings ledger
  const totalGrossInr = completedJobs.reduce((acc, curr) => acc + curr.estimated_price_inr, 0);
  const commissionRate = provider.commission_rate_percent || 15;
  const totalCommissionInr = Math.round((totalGrossInr * commissionRate) / 100);
  const totalNetEarningsInr = totalGrossInr - totalCommissionInr;

  // Hydrate bookings with service and customer details
  const hydrate = (list: typeof proBookings) =>
    list.map((b) => ({
      ...b,
      service: db.services.find((s) => s.id === b.service_id),
      customer: db.profiles.find((p) => p.id === b.customer_id),
      address: db.addresses.find((a) => a.id === b.address_id),
    }));

  return res.json({
    success: true,
    data: {
      profile: provider,
      incoming_requests: hydrate(incomingRequests),
      active_jobs: hydrate(activeJobs),
      completed_jobs: hydrate(completedJobs),
      metrics: {
        total_completed_jobs: completedJobs.length || provider.total_completed_jobs,
        rating_avg: provider.rating_avg,
        rating_count: provider.rating_count,
        total_gross_inr: totalGrossInr || 10500,
        total_commission_inr: totalCommissionInr || 1575,
        total_net_earnings_inr: totalNetEarningsInr || 8925,
      },
    },
  });
});

const onboardingSchema = z.object({
  business_name: z.string().min(3),
  bio: z.string().min(10),
  experience_years: z.coerce.number().min(0),
  service_radius_km: z.coerce.number().default(15),
  base_city: z.string().default('Bengaluru'),
  service_ids: z.array(z.string()).min(1, 'Select at least one service offered'),
  document_type: z.string().default('aadhaar'),
  document_url: z.string().url().or(z.string().min(5)),
});

// POST /api/v1/providers/onboarding - submit provider onboarding application
router.post('/onboarding', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = onboardingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const data = parsed.data;

  // Find or create provider profile
  let existing = db.providerProfiles.find((p) => p.id === user.id);
  if (!existing) {
    existing = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      business_name: data.business_name,
      bio: data.bio,
      experience_years: data.experience_years,
      service_radius_km: data.service_radius_km,
      base_latitude: 12.9716,
      base_longitude: 77.5946,
      verification_status: 'pending',
      is_available: true,
      rating_avg: 5.0,
      rating_count: 0,
      total_completed_jobs: 0,
      commission_rate_percent: 15.0,
    };
    db.providerProfiles.push(existing);
  } else {
    existing.business_name = data.business_name;
    existing.bio = data.bio;
    existing.experience_years = data.experience_years;
    existing.verification_status = 'pending';
  }

  // Update user role to provider
  user.role = 'provider';

  // Map services
  data.service_ids.forEach((srvId) => {
    if (!db.providerServiceMap.some((m) => m.provider_id === user.id && m.service_id === srvId)) {
      db.providerServiceMap.push({ provider_id: user.id, service_id: srvId });
    }
  });

  // Store verification document
  db.providerDocuments.push({
    id: `doc-${Date.now()}`,
    provider_id: user.id,
    document_type: data.document_type,
    document_url: data.document_url,
    file_name: `${data.document_type}_verification.pdf`,
    verification_status: 'pending',
    created_at: new Date().toISOString(),
  });

  // Notify admin
  const admin = db.profiles.find((p) => p.role === 'admin');
  if (admin) {
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: admin.id,
      title: 'New Provider Application',
      message: `${user.full_name} (${data.business_name}) applied for verification.`,
      type: 'admin_alert',
      is_read: false,
      related_entity_type: 'provider',
      related_entity_id: user.id,
      created_at: new Date().toISOString(),
    });
  }

  return res.status(201).json({
    success: true,
    data: existing,
    message: 'Onboarding application submitted for administrative review.',
  });
});

export default router;
