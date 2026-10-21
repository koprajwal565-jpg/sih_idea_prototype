import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('FixNear Backend API Integration Tests', () => {
  it('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('FixNear Backend API');
  });

  it('GET /api/v1/categories returns list of active categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('slug');
  });

  it('GET /api/v1/services returns services and supports filtering', async () => {
    const res = await request(app).get('/api/v1/services?category_slug=electrician');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].category_name).toBe('Electrician');
  });

  it('GET /api/v1/services/:slugOrId returns service with eligible providers', async () => {
    const res = await request(app).get('/api/v1/services/fan-install-repair');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Ceiling Fan Installation & Repair');
    expect(res.body.data.base_price_inr).toBe(199);
    expect(Array.isArray(res.body.data.eligible_providers)).toBe(true);
  });

  let createdBookingId = '';
  it('POST /api/v1/bookings creates a booking with server-calculated price', async () => {
    const payload = {
      service_id: 's1000000-0000-0000-0000-000000000001',
      address_id: 'd1000000-0000-0000-0000-000000000001',
      scheduled_date: '2026-11-01',
      scheduled_time_slot: '10:00 AM - 12:00 PM',
      problem_description: 'Need new fan installed on high ceiling.',
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('x-demo-user-id', 'u1000000-0000-0000-0000-000000000001')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking_reference).toMatch(/^FIX-2026-\d{4}$/);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.estimated_price_inr).toBe(199);
    expect(res.body.data.final_price_inr).toBe(248); // 199 base + 49 platform fee
    createdBookingId = res.body.data.id;
  });

  it('POST /api/v1/payments/create-order generates demo or test order', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .set('x-demo-user-id', 'u1000000-0000-0000-0000-000000000001')
      .send({
        booking_id: createdBookingId,
        is_demo: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_id).toBeDefined();
    expect(res.body.data.amount).toBe(24800); // 248 INR in paise
  });

  it('POST /api/v1/payments/verify verifies payment and updates booking status', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('x-demo-user-id', 'u1000000-0000-0000-0000-000000000001')
      .send({
        booking_id: createdBookingId,
        razorpay_order_id: 'order_demo_test',
        razorpay_payment_id: 'pay_demo_test_999',
        razorpay_signature: 'sig_demo',
        is_demo: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking.payment_status).toBe('paid');
    expect(res.body.data.booking.status).toBe('confirmed');
  });

  it('PATCH /api/v1/bookings/:id/status enforces valid state machine transitions', async () => {
    // Valid transition: confirmed -> provider_assigned
    const validRes = await request(app)
      .patch(`/api/v1/bookings/${createdBookingId}/status`)
      .set('x-demo-user-id', 'a1000000-0000-0000-0000-000000000001')
      .send({ status: 'provider_assigned' });

    expect(validRes.status).toBe(200);
    expect(validRes.body.data.status).toBe('provider_assigned');

    // Invalid transition: provider_assigned cannot jump directly to completed!
    const invalidRes = await request(app)
      .patch(`/api/v1/bookings/${createdBookingId}/status`)
      .set('x-demo-user-id', 'a1000000-0000-0000-0000-000000000001')
      .send({ status: 'completed' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('POST /api/v1/ai/assist-booking identifies service intent from natural language', async () => {
    const res = await request(app)
      .post('/api/v1/ai/assist-booking')
      .send({ query: 'My master bedroom split AC is blowing hot air and not cooling' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.detected_category.slug).toBe('ac-appliances');
    expect(res.body.data.suggested_service.slug).toBe('split-ac-foam-cleaning');
    expect(Array.isArray(res.body.data.clarifying_questions)).toBe(true);
  });

  it('GET /api/v1/admin/metrics returns real calculated counts from database', async () => {
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('x-demo-user-id', 'a1000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_bookings).toBeGreaterThanOrEqual(2);
    expect(res.body.data.verified_providers).toBeGreaterThanOrEqual(1);
  });
});
