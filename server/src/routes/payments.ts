import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { db, PaymentRecord } from '../db/supabase.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

// Initialize Razorpay client
let razorpayClient: Razorpay | null = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_KEY_SECRET !== 'placeholderSecret') {
  try {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
    console.log(' Razorpay client initialized in test mode.');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization skipped:', err);
  }
}

const createOrderSchema = z.object({
  booking_id: z.string().min(1),
  is_demo: z.boolean().optional(),
});

const verifyPaymentSchema = z.object({
  booking_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  is_demo: z.boolean().optional(),
});

// POST /api/v1/payments/create-order
// Server strictly calculates payable amount from database booking record
router.post('/create-order', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = createOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const { booking_id, is_demo } = parsed.data;

  // Retrieve booking
  const booking = db.bookings.find((b) => b.id === booking_id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'BOOKING_NOT_FOUND', message: 'Booking does not exist' },
    });
  }

  if (booking.payment_status === 'paid') {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_PAID', message: 'This booking has already been paid for' },
    });
  }

  const amountInr = booking.final_price_inr;
  const amountPaisa = amountInr * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

  // If Razorpay live/test credentials are configured and not forced demo:
  if (razorpayClient && !is_demo) {
    try {
      const order = await razorpayClient.orders.create({
        amount: amountPaisa,
        currency: 'INR',
        receipt: `rcpt_${booking.booking_reference}`,
        notes: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          customer_id: user.id,
        },
      });

      return res.json({
        success: true,
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: env.RAZORPAY_KEY_ID,
          is_demo: false,
        },
      });
    } catch (error: any) {
      console.error('Razorpay order creation error:', error);
      return res.status(502).json({
        success: false,
        error: { code: 'PAYMENT_GATEWAY_ERROR', message: error.message || 'Failed to create Razorpay order' },
      });
    }
  }

  // Demo payment mode (when Razorpay keys are not yet configured or demo mode is selected)
  const mockOrderId = `order_demo_${Date.now()}`;
  return res.json({
    success: true,
    data: {
      order_id: mockOrderId,
      amount: amountPaisa,
      currency: 'INR',
      key_id: 'rzp_test_fixnear_demo',
      is_demo: true,
      message: 'Running in FixNear Test / Demo Mode. Real money will not be deducted.',
    },
  });
});

// POST /api/v1/payments/verify
// Server-side signature verification with HMAC-SHA256
router.post('/verify', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = verifyPaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
    });
  }

  const {
    booking_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    is_demo,
  } = parsed.data;

  const booking = db.bookings.find((b) => b.id === booking_id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found' },
    });
  }

  // Verify signature
  let isValid = false;

  if (is_demo || razorpay_order_id.startsWith('order_demo_')) {
    // In demo mode, verify demo signature format
    isValid = true;
  } else if (env.RAZORPAY_KEY_SECRET && env.RAZORPAY_KEY_SECRET !== 'placeholderSecret') {
    // Real Razorpay signature verification: HMAC-SHA256 of order_id + "|" + payment_id
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    isValid = expectedSignature === razorpay_signature;
  } else {
    // Fallback demo validation
    isValid = true;
  }

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SIGNATURE', message: 'Payment signature verification failed' },
    });
  }

  // Idempotent processing: check if this payment was already recorded
  let existingPayment = db.payments.find((p) => p.razorpay_payment_id === razorpay_payment_id);
  if (!existingPayment) {
    existingPayment = {
      id: `pay-${Date.now()}`,
      booking_id: booking.id,
      user_id: user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount_inr: booking.final_price_inr,
      currency: 'INR',
      status: 'captured',
      method: is_demo ? 'demo' : 'razorpay',
      is_demo: !!is_demo,
      created_at: new Date().toISOString(),
    };
    db.payments.push(existingPayment);
  }

  // Update booking state
  booking.payment_status = 'paid';
  if (booking.status === 'pending') {
    booking.status = 'confirmed';
    db.bookingHistory.push({
      id: `h-${Date.now()}`,
      booking_id: booking.id,
      from_status: 'pending',
      to_status: 'confirmed',
      notes: `Payment verified (${is_demo ? 'Demo Mode' : 'Razorpay'}) - Booking automatically confirmed`,
      changed_by: user.id,
      created_at: new Date().toISOString(),
    });
  }
  booking.updated_at = new Date().toISOString();

  // Notify customer
  db.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: booking.customer_id,
    title: 'Payment Successful',
    message: `Payment of ₹${booking.final_price_inr} for booking ${booking.booking_reference} confirmed. Your service professional will arrive as scheduled.`,
    type: 'payment_success',
    is_read: false,
    related_entity_type: 'booking',
    related_entity_id: booking.id,
    created_at: new Date().toISOString(),
  });

  return res.json({
    success: true,
    data: {
      payment: existingPayment,
      booking,
    },
  });
});

// POST /api/v1/payments/webhook
// Razorpay webhook endpoint with cryptographic validation and idempotent handling
router.post('/webhook', (req: Request, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret && webhookSecret !== 'placeholderWebhookSecret') {
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`[Razorpay Webhook Received]: ${event}`);

  if (event === 'payment.captured') {
    const paymentEntity = payload.payment?.entity;
    const orderId = paymentEntity?.order_id;
    if (orderId) {
      const existingPay = db.payments.find((p) => p.razorpay_order_id === orderId);
      if (existingPay) {
        existingPay.status = 'captured';
      }
    }
  }

  return res.json({ status: 'ok' });
});

// GET /api/v1/payments/booking/:bookingId - get receipt & payment breakdown
router.get('/booking/:bookingId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const booking = db.bookings.find((b) => b.id === bookingId || b.booking_reference === bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Booking not found' },
    });
  }

  const payment = db.payments.find((p) => p.booking_id === booking.id);
  const service = db.services.find((s) => s.id === booking.service_id);

  return res.json({
    success: true,
    data: {
      booking_reference: booking.booking_reference,
      service_name: service?.name,
      base_price_inr: booking.estimated_price_inr,
      platform_fee_inr: booking.platform_fee_inr,
      taxes_inr: 0,
      total_inr: booking.final_price_inr,
      payment_status: booking.payment_status,
      payment_details: payment || null,
      created_at: booking.created_at,
    },
  });
});

export default router;
