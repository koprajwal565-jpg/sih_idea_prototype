import { Router, Response } from 'express';
import { z } from 'zod';
import { db, ReviewItem } from '../db/supabase.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

const createReviewSchema = z.object({
  booking_id: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(3, 'Review comment must have at least 3 characters'),
});

// POST /api/v1/reviews - submit a review for completed booking
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = createReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { booking_id, rating, comment } = parsed.data;

  // Verify booking exists
  const booking = db.bookings.find((b) => b.id === booking_id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Booking not found' },
    });
  }

  if (booking.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATE', message: 'Reviews can only be submitted for completed bookings' },
    });
  }

  // Check if review already exists
  const existing = db.reviews.find((r) => r.booking_id === booking_id);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'ALREADY_REVIEWED', message: 'You have already submitted a review for this booking' },
    });
  }

  const newReview: ReviewItem = {
    id: `r-${Date.now()}`,
    booking_id,
    customer_id: user.id,
    customer_name: user.full_name,
    provider_id: booking.provider_id || '',
    rating,
    comment,
    created_at: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  // Recalculate provider average rating
  if (booking.provider_id) {
    const pro = db.providerProfiles.find((p) => p.id === booking.provider_id);
    if (pro) {
      const proReviews = db.reviews.filter((r) => r.provider_id === pro.id);
      const sum = proReviews.reduce((acc, r) => acc + r.rating, 0);
      pro.rating_count = proReviews.length;
      pro.rating_avg = parseFloat((sum / proReviews.length).toFixed(2));
    }
  }

  return res.status(201).json({
    success: true,
    data: newReview,
  });
});

// GET /api/v1/reviews/provider/:providerId - list reviews for provider
router.get('/provider/:providerId', (req, res) => {
  const { providerId } = req.params;
  const reviews = db.reviews
    .filter((r) => r.provider_id === providerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

export default router;
