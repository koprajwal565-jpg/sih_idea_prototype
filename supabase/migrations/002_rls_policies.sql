-- ========================================================
-- FixNear Platform: PostgreSQL Schema Migration 002
-- Row Level Security (RLS) Policies
-- ========================================================

-- Enable RLS on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_price_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from auth.jwt() or profile
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are readable"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. CUSTOMER ADDRESSES POLICIES
CREATE POLICY "Customers can manage own addresses"
    ON customer_addresses FOR ALL
    USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view address of active bookings"
    ON customer_addresses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.address_id = customer_addresses.id
            AND bookings.provider_id = auth.uid()
            AND bookings.status IN ('provider_assigned', 'provider_en_route', 'in_progress')
        )
    );

-- 3. PROVIDER PROFILES POLICIES
CREATE POLICY "Verified providers are viewable by everyone"
    ON provider_profiles FOR SELECT
    USING (verification_status = 'verified' OR auth.uid() = id OR auth.get_user_role() = 'admin');

CREATE POLICY "Providers can update own profile"
    ON provider_profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. PROVIDER DOCUMENTS POLICIES
CREATE POLICY "Providers can view and upload own documents"
    ON provider_documents FOR ALL
    USING (auth.uid() = provider_id OR auth.get_user_role() = 'admin');

-- 5. SERVICE CATALOG POLICIES
CREATE POLICY "Service categories are viewable by all"
    ON service_categories FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage service categories"
    ON service_categories FOR ALL
    USING (auth.get_user_role() = 'admin');

CREATE POLICY "Services are viewable by all"
    ON services FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage services"
    ON services FOR ALL
    USING (auth.get_user_role() = 'admin');

-- 6. PROVIDER SERVICES & AVAILABILITY
CREATE POLICY "Provider services are viewable by all"
    ON provider_services FOR SELECT
    USING (true);

CREATE POLICY "Providers manage own service mappings"
    ON provider_services FOR ALL
    USING (auth.uid() = provider_id);

CREATE POLICY "Provider availability is viewable by all"
    ON provider_availability FOR SELECT
    USING (true);

CREATE POLICY "Providers manage own availability"
    ON provider_availability FOR ALL
    USING (auth.uid() = provider_id);

-- 7. BOOKINGS POLICIES
CREATE POLICY "Customers view own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = customer_id OR auth.uid() = provider_id OR auth.get_user_role() = 'admin');

CREATE POLICY "Customers can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Parties can update booking state as permitted"
    ON bookings FOR UPDATE
    USING (auth.uid() = customer_id OR auth.uid() = provider_id OR auth.get_user_role() = 'admin');

-- 8. BOOKING ATTACHMENTS & BREAKDOWN
CREATE POLICY "Booking attachments accessible by involved parties"
    ON booking_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_attachments.booking_id
            AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid() OR auth.get_user_role() = 'admin')
        )
    );

CREATE POLICY "Booking breakdowns viewable by involved parties"
    ON booking_price_breakdowns FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_price_breakdowns.booking_id
            AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid() OR auth.get_user_role() = 'admin')
        )
    );

-- 9. PAYMENTS & REFUNDS
CREATE POLICY "Customers view own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id OR auth.get_user_role() = 'admin');

CREATE POLICY "Customers view own refunds"
    ON refunds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = refunds.booking_id
            AND (bookings.customer_id = auth.uid() OR auth.get_user_role() = 'admin')
        )
    );

-- 10. REVIEWS POLICIES
CREATE POLICY "Reviews viewable by everyone"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Customers can write reviews for completed bookings"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

-- 11. NOTIFICATIONS
CREATE POLICY "Users can only read and manage own notifications"
    ON notifications FOR ALL
    USING (auth.uid() = user_id);

-- 12. SUPPORT TICKETS
CREATE POLICY "Users view own support tickets"
    ON support_tickets FOR ALL
    USING (auth.uid() = user_id OR auth.get_user_role() = 'admin');

-- 13. ADMIN AUDIT LOGS
CREATE POLICY "Only admins view audit logs"
    ON admin_audit_logs FOR SELECT
    USING (auth.get_user_role() = 'admin');
