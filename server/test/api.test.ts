import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('FixNear Backend API & RBAC Integration Tests', () => {
  let customerToken = '';
  let providerToken = '';
  let adminToken = '';

  // 1. PUBLIC ROUTES ACCESSIBILITY
  it('GET /health returns 200 and healthy status (Public)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('FixNear Backend API');
  });

  it('GET /api/v1/categories returns list of active categories (Public)', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/services returns services catalog (Public)', async () => {
    const res = await request(app).get('/api/v1/services?category_slug=electrician');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 2. AUTHENTICATION & PASSWORD HASHING TESTS
  it('POST /api/v1/auth/register allows Customer registration with hashed password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      full_name: 'Ananya Rao',
      email: 'ananya.rao@example.com',
      phone: '+91 99887 76655',
      password: 'SecurePassword@123',
      role: 'customer',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.password_hash).toBeUndefined(); // ensure password hash is never exposed
  });

  it('POST /api/v1/auth/register allows Worker/Provider registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      full_name: 'Kiran Electrician',
      email: 'kiran.pro@example.com',
      phone: '+91 99887 76656',
      password: 'SecurePassword@123',
      role: 'provider',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('provider');
  });

  it('POST /api/v1/auth/register BLOCKS public registration as Admin with 403 Forbidden', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      full_name: 'Hacker Attempt',
      email: 'hacker@example.com',
      phone: '+91 99999 00000',
      password: 'MaliciousPassword@123',
      role: 'admin',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  it('POST /api/v1/auth/login validates credentials and returns signed JWT for Customer', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'rahul.sharma@example.com',
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('customer');
    customerToken = res.body.token;
  });

  it('POST /api/v1/auth/login validates credentials and returns signed JWT for Worker/Provider', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'ramesh.electrician@example.com',
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('provider');
    providerToken = res.body.token;
  });

  it('POST /api/v1/auth/login validates credentials and returns signed JWT for Admin', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@fixnear.in',
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  it('POST /api/v1/auth/login rejects wrong password with 401 Unauthorized', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'rahul.sharma@example.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/v1/auth/me returns profile when token is valid and 401 when missing', async () => {
    const unauthRes = await request(app).get('/api/v1/auth/me');
    expect(unauthRes.status).toBe(401);
    expect(unauthRes.body.error.code).toBe('UNAUTHORIZED');

    const authRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.user.email).toBe('rahul.sharma@example.com');
  });

  // 3. ROLE-BASED ACCESS CONTROL (RBAC) RESTRICTION TESTS
  it('GET /api/v1/admin/metrics strictly blocks unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/metrics');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/admin/metrics strictly blocks Customer with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/v1/admin/metrics strictly blocks Worker/Provider with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/v1/admin/metrics allows Administrator with 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_bookings).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/providers/me/dashboard strictly blocks Customer with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/providers/me/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/v1/providers/me/dashboard allows Worker/Provider with 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/providers/me/dashboard')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
  });

  // 4. BOOKINGS LIFECYCLE WITH AUTHENTICATION
  let createdBookingId = '';
  it('POST /api/v1/bookings rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/v1/bookings').send({
      service_id: 's1000000-0000-0000-0000-000000000001',
      address_id: 'd1000000-0000-0000-0000-000000000001',
      scheduled_date: '2026-11-01',
      scheduled_time_slot: '10:00 AM - 12:00 PM',
      problem_description: 'Need new fan installed on high ceiling.',
    });

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/bookings creates booking when authenticated with customer token', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        service_id: 's1000000-0000-0000-0000-000000000001',
        address_id: 'd1000000-0000-0000-0000-000000000001',
        scheduled_date: '2026-11-05',
        scheduled_time_slot: '10:00 AM - 12:00 PM',
        problem_description: 'Need fan installed with balanced bracket fitting.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.final_price_inr).toBe(248);
    createdBookingId = res.body.data.id;
  });

  it('POST /api/v1/payments/verify updates booking status to confirmed', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        booking_id: createdBookingId,
        razorpay_order_id: 'order_demo_test',
        razorpay_payment_id: 'pay_demo_test_999',
        razorpay_signature: 'sig_demo',
        is_demo: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.booking.payment_status).toBe('paid');
  });

  it('POST /api/v1/auth/admin/create-user allows authorized Admin to create accounts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/create-user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'Secondary Admin',
        email: 'secondary.admin@fixnear.in',
        phone: '+91 99999 11111',
        password: 'AdminPassword@123',
        role: 'admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
  });
});
