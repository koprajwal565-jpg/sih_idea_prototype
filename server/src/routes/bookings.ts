import { Router, Response } from 'express';
import { z } from 'zod';
import { db, Booking } from '../db/supabase.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

const createBookingSchema = z.object({
  service_id: z.string().uuid().or(z.string().min(1)),
  address_id: z.string().uuid().or(z.string().min(1)),
  provider_id: z.string().uuid().or(z.string().min(1)).optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  scheduled_time_slot: z.string().min(3),
  problem_description: z.string().min(5, 'Please provide at least 5 characters describing the issue'),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'provider_assigned',
    'provider_en_route',
    'in_progress',
    'completed',
    'cancellation_requested',
    'cancelled',
    'disputed',
  ]),
  notes: z.string().optional(),
});

// Valid state machine transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['provider_assigned', 'cancellation_requested', 'cancelled'],
  provider_assigned: ['provider_en_route', 'cancellation_requested', 'cancelled'],
  provider_en_route: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'disputed'],
  cancellation_requested: ['cancelled', 'confirmed'],
  disputed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// Helper: generate unique reference code e.g. FIX-2026-8921
const generateBookingReference = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `FIX-2026-${randomDigits}`;
};

// GET /api/v1/bookings - list user or provider bookings
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let bookings = [...db.bookings];

  if (user.role === 'customer') {
    bookings = bookings.filter((b) => b.customer_id === user.id);
  } else if (user.role === 'provider') {
    bookings = bookings.filter((b) => b.provider_id === user.id);
  }
  // Admin sees all

  // Hydrate joins
  const hydrated = bookings.map((b) => ({
    ...b,
    service: db.services.find((s) => s.id === b.service_id),
    customer: db.profiles.find((p) => p.id === b.customer_id),
    provider: db.providerProfiles.find((p) => p.id === b.provider_id),
    address: db.addresses.find((a) => a.id === b.address_id),
  }));

  // Sort descending by created_at
  hydrated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json({
    success: true,
    count: hydrated.length,
    data: hydrated,
  });
});

// GET /api/v1/bookings/:id - get single booking details
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const booking = db.bookings.find((b) => b.id === id || b.booking_reference === id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Booking not found' },
    });
  }

  // Authorization check: customer can only view own bookings, providers can view assigned, admin can view all
  if (user.role === 'customer' && booking.customer_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied to this booking' },
    });
  }

  const service = db.services.find((s) => s.id === booking.service_id);
  const customer = db.profiles.find((p) => p.id === booking.customer_id);
  const provider = db.providerProfiles.find((p) => p.id === booking.provider_id);
  const address = db.addresses.find((a) => a.id === booking.address_id);
  const history = db.bookingHistory.filter((h) => h.booking_id === booking.id);
  const payment = db.payments.find((p) => p.booking_id === booking.id);

  return res.json({
    success: true,
    data: {
      ...booking,
      service,
      customer,
      provider,
      address,
      history,
      payment,
    },
  });
});

// POST /api/v1/bookings - create booking with anti-double-booking and server-side pricing
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = createBookingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid booking data',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const {
    service_id,
    address_id,
    provider_id,
    scheduled_date,
    scheduled_time_slot,
    problem_description,
  } = parsed.data;

  // 1. Verify service exists
  const service = db.services.find((s) => s.id === service_id);
  if (!service) {
    return res.status(404).json({
      success: false,
      error: { code: 'SERVICE_NOT_FOUND', message: 'Requested service does not exist' },
    });
  }

  // 2. Verify address exists
  const address = db.addresses.find((a) => a.id === address_id);
  if (!address) {
    return res.status(404).json({
      success: false,
      error: { code: 'ADDRESS_NOT_FOUND', message: 'Selected address does not exist' },
    });
  }

  // 3. Select eligible provider if specified or auto-assign from verified providers for service
  let assignedProviderId = provider_id;
  if (!assignedProviderId) {
    const eligibleMappings = db.providerServiceMap.filter((m) => m.service_id === service.id);
    const availablePro = db.providerProfiles.find(
      (p) =>
        p.verification_status === 'verified' &&
        p.is_available &&
        eligibleMappings.some((m) => m.provider_id === p.id)
    );
    if (availablePro) {
      assignedProviderId = availablePro.id;
    }
  }

  // 4. Anti-double-booking check
  if (assignedProviderId) {
    const slotConflict = db.bookings.find(
      (b) =>
        b.provider_id === assignedProviderId &&
        b.scheduled_date === scheduled_date &&
        b.scheduled_time_slot === scheduled_time_slot &&
        ['confirmed', 'provider_assigned', 'provider_en_route', 'in_progress'].includes(b.status)
    );

    if (slotConflict) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SLOT_UNAVAILABLE',
          message: 'The selected provider is already booked for this date and time slot. Please choose another slot or provider.',
        },
      });
    }
  }

  // 5. Server-side price calculation (never trust client)
  const basePrice = service.base_price_inr;
  const platformFee = 49; // standard platform fee
  const finalPrice = basePrice + platformFee;
  const providerCommissionRate = 0.15; // 15% platform commission
  const providerPayout = Math.round(basePrice * (1 - providerCommissionRate));

  const newBookingId = `b-${Date.now()}`;
  const bookingRef = generateBookingReference();

  const newBooking: Booking = {
    id: newBookingId,
    booking_reference: bookingRef,
    customer_id: user.id,
    provider_id: assignedProviderId,
    service_id: service.id,
    address_id: address.id,
    status: 'pending',
    scheduled_date,
    scheduled_time_slot,
    problem_description,
    estimated_price_inr: basePrice,
    final_price_inr: finalPrice,
    platform_fee_inr: platformFee,
    provider_payout_inr: providerPayout,
    payment_status: 'unpaid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);

  // Add initial status history record
  db.bookingHistory.push({
    id: `h-${Date.now()}`,
    booking_id: newBookingId,
    to_status: 'pending',
    notes: 'Booking requested by customer',
    changed_by: user.id,
    created_at: new Date().toISOString(),
  });

  // Create notifications
  db.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: user.id,
    title: 'Booking Created',
    message: `Your booking ${bookingRef} for ${service.name} is received. Please complete payment to confirm.`,
    type: 'booking_created',
    is_read: false,
    related_entity_type: 'booking',
    related_entity_id: newBookingId,
    created_at: new Date().toISOString(),
  });

  if (assignedProviderId) {
    db.notifications.push({
      id: `notif-${Date.now() + 1}`,
      user_id: assignedProviderId,
      title: 'New Service Request',
      message: `New request ${bookingRef} for ${service.name} on ${scheduled_date} (${scheduled_time_slot}).`,
      type: 'provider_request',
      is_read: false,
      related_entity_type: 'booking',
      related_entity_id: newBookingId,
      created_at: new Date().toISOString(),
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      ...newBooking,
      service,
      address,
    },
  });
});

// PATCH /api/v1/bookings/:id/status - state transition handler
router.patch('/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { status: targetStatus, notes } = parsed.data;
  const booking = db.bookings.find((b) => b.id === id || b.booking_reference === id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Booking not found' },
    });
  }

  // Validate state machine transition
  const allowed = ALLOWED_TRANSITIONS[booking.status] || [];
  if (!allowed.includes(targetStatus)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: `Cannot transition booking status from '${booking.status}' to '${targetStatus}'. Allowed transitions: ${allowed.join(', ') || 'None'}`,
      },
    });
  }

  const previousStatus = booking.status;
  booking.status = targetStatus;
  booking.updated_at = new Date().toISOString();

  // If marked completed, update provider completed jobs counter
  if (targetStatus === 'completed' && booking.provider_id) {
    const pro = db.providerProfiles.find((p) => p.id === booking.provider_id);
    if (pro) {
      pro.total_completed_jobs = (pro.total_completed_jobs || 0) + 1;
    }
  }

  // Log transition history
  db.bookingHistory.push({
    id: `h-${Date.now()}`,
    booking_id: booking.id,
    from_status: previousStatus,
    to_status: targetStatus,
    notes: notes || `Status updated to ${targetStatus}`,
    changed_by: user.id,
    created_at: new Date().toISOString(),
  });

  // Notify customer
  db.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: booking.customer_id,
    title: `Booking Update: ${targetStatus.replace('_', ' ').toUpperCase()}`,
    message: `Your booking ${booking.booking_reference} is now ${targetStatus.replace('_', ' ')}.`,
    type: 'booking_status',
    is_read: false,
    related_entity_type: 'booking',
    related_entity_id: booking.id,
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: booking,
  });
});

// POST /api/v1/bookings/:id/cancel - customer or provider cancellation
router.post('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const reason = (req.body.reason as string) || 'Cancelled by user';

  const booking = db.bookings.find((b) => b.id === id || b.booking_reference === id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Booking not found' },
    });
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'CANNOT_CANCEL', message: `Booking in '${booking.status}' state cannot be cancelled` },
    });
  }

  const previousStatus = booking.status;
  booking.status = 'cancelled';
  booking.cancellation_reason = reason;
  booking.updated_at = new Date().toISOString();

  db.bookingHistory.push({
    id: `h-${Date.now()}`,
    booking_id: booking.id,
    from_status: previousStatus,
    to_status: 'cancelled',
    notes: `Cancelled by ${user.role} (${user.full_name}): ${reason}`,
    changed_by: user.id,
    created_at: new Date().toISOString(),
  });

  // Notify customer and provider
  db.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: booking.customer_id,
    title: 'Booking Cancelled',
    message: `Booking ${booking.booking_reference} has been cancelled. Reason: ${reason}`,
    type: 'booking_cancelled',
    is_read: false,
    related_entity_type: 'booking',
    related_entity_id: booking.id,
    created_at: new Date().toISOString(),
  });

  if (booking.provider_id) {
    db.notifications.push({
      id: `notif-${Date.now() + 1}`,
      user_id: booking.provider_id,
      title: 'Booking Cancelled',
      message: `Booking ${booking.booking_reference} was cancelled.`,
      type: 'booking_cancelled',
      is_read: false,
      related_entity_type: 'booking',
      related_entity_id: booking.id,
      created_at: new Date().toISOString(),
    });
  }

  return res.json({
    success: true,
    data: booking,
  });
});

export default router;
