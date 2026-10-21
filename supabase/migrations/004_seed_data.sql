-- ========================================================
-- FixNear Platform: PostgreSQL Schema Migration 004
-- Comprehensive Seed Data for Indian Home Services Marketplace
-- ========================================================

-- 1. SEED SERVICE CATEGORIES
INSERT INTO service_categories (id, name, slug, description, icon_name, display_order)
VALUES
('c1000000-0000-0000-0000-000000000001', 'Electrician', 'electrician', 'Expert electrical repairs, wiring, switches, fans, and appliance installations.', 'Zap', 1),
('c1000000-0000-0000-0000-000000000002', 'Plumbing', 'plumbing', 'Tap leakage, wash basin, pipe fitting, water tank, and bathroom fittings.', 'Droplet', 2),
('c1000000-0000-0000-0000-000000000003', 'AC & Appliance Repair', 'ac-appliances', 'AC servicing, refrigerator, microwave, and washing machine repairs.', 'Wind', 3),
('c1000000-0000-0000-0000-000000000004', 'Carpentry', 'carpentry', 'Door lock installation, furniture assembly, hinges, and woodwork.', 'Hammer', 4),
('c1000000-0000-0000-0000-000000000005', 'House Cleaning', 'cleaning', 'Deep home cleaning, sparkling bathroom, kitchen degreasing, and sofa care.', 'Sparkles', 5),
('c1000000-0000-0000-0000-000000000006', 'Painting & Waterproofing', 'painting', 'Interior wall painting, touchups, exterior coatings, and damp proofing.', 'Paintbrush', 6),
('c1000000-0000-0000-0000-000000000007', 'Pest Control', 'pest-control', 'Eco-friendly pest treatment for cockroaches, termites, bedbugs, and rodents.', 'ShieldAlert', 7),
('c1000000-0000-0000-0000-000000000008', 'RO & Water Purifier', 'ro-water-purifier', 'Water filter service, sediment filter change, RO membrane, and TDS check.', 'ShieldCheck', 8)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED SERVICES
INSERT INTO services (id, category_id, name, slug, description, base_price_inr, duration_minutes, inclusions, exclusions)
VALUES
-- Electrician Services
('s1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Ceiling Fan Installation & Repair', 'fan-install-repair', 'Complete inspection, balancing, capacitor check, and secure hanging of ceiling fans.', 199, 45, ARRAY['Capacitor check', 'Secure ceiling bracket fitting', 'Blade balancing', 'Post-service test'], ARRAY['New fan or spare parts cost', 'Concealed wiring rerouting']),
('s1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Switchboard Repair & Replacement', 'switchboard-repair', 'Repair or replacement of damaged switches, sockets, regulators, or MCB trips.', 149, 30, ARRAY['Diagnosis of short circuits', 'Socket/Switch replacement', 'Earthing check'], ARRAY['Cost of replacement switches/plates']),
('s1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Inverter & Battery Setup / Checkup', 'inverter-battery-setup', 'Complete inverter installation, battery water top-up, wiring connection, and load test.', 499, 60, ARRAY['Inverter cabling', 'Battery terminal grease & cleaning', 'Load balancing test'], ARRAY['Inverter or battery unit', 'External heavy-duty cables']),

-- Plumbing Services
('s1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Tap & Mixer Leakage Repair', 'tap-mixer-repair', 'Fix dripping taps, loose handles, cartridge replacement, or wall mixer installations.', 149, 30, ARRAY['Washer/cartridge replacement', 'Teflon tape sealing', 'Pressure check'], ARRAY['Cost of new taps/spares']),
('s1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Drain Blockage Removal', 'drain-blockage-removal', 'Clearing kitchen sink, bathroom trap, or balcony floor drain blockages using drain auger.', 299, 45, ARRAY['Chemical-safe unclogging', 'Debris removal', 'High-flow water test'], ARRAY['Major underground pipe replacement']),
('s1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Toilet Flush Tank Repair', 'toilet-flush-repair', 'Repair or replacement of siphon valve, ball valve, push button, or internal float.', 249, 40, ARRAY['Flush mechanism inspection', 'Leak prevention', 'Water level adjustment'], ARRAY['New flush tank unit']),

-- AC & Appliances
('s1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Split AC Deep Foam Cleaning', 'split-ac-foam-cleaning', 'Power jet cleaning of indoor cooling coils, blower, outdoor unit cleaning, and gas check.', 599, 60, ARRAY['Indoor unit foam spray & wash', 'Blower & tray deep cleaning', 'Outdoor unit jet spray', 'Gas pressure diagnosis'], ARRAY['Gas recharge cost (if low)', 'Spare parts']),
('s1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Washing Machine Diagnosis & Service', 'washing-machine-service', 'Diagnosis of spin errors, drainage issues, drum noise, or motor malfunction.', 299, 45, ARRAY['Full diagnostic report', 'Filter and inlet valve cleaning', 'Vibration leveling check'], ARRAY['Spare motor or PCB replacement']),

-- Carpentry
('s1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000004', 'Door Lock & Latch Installation', 'door-lock-installation', 'Fitting mortise locks, cylinder locks, pad latches, or magnetic door stoppers.', 249, 45, ARRAY['Precise wood chiseling & drilling', 'Lock mechanism alignment', 'Smooth latch testing'], ARRAY['Lock hardware cost']),
('s1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000004', 'Furniture Assembly (Bed/Table/Wardrobe)', 'furniture-assembly', 'Professional assembly of flat-pack furniture (IKEA, Urban Ladder, Pepperfry).', 499, 90, ARRAY['Structural alignment', 'Hardware bolt torquing', 'Stability leveling'], ARRAY['Wall anchoring hardware (if unprovided)']),

-- House Cleaning
('s1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000005', 'Intense Bathroom Deep Cleaning', 'bathroom-deep-cleaning', 'Descaling hard water stains from tiles, glass partitions, taps, basin, and WC disinfection.', 449, 60, ARRAY['Tile scrubbing with machine', 'Limescale removal on chrome taps', 'Toilet bowl sanitization', 'Mirror and counter wipe'], ARRAY['Wall paint scrubbing']),
('s1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000005', 'Complete Kitchen Degreasing & Cleaning', 'kitchen-cleaning', 'Degreasing chimney exterior, gas stove, tile backsplash, countertop, and cabinet exterior.', 999, 120, ARRAY['Heavy grease remover treatment', 'Exhaust & stove scrubbing', 'Floor wash with disinfectant'], ARRAY['Interior utensil rearrangement']),

-- RO & Water Purifier
('s1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000008', 'RO Purifier Complete Service & TDS Check', 'ro-purifier-service', 'Sediment bowl flush, carbon filter check, pump pressure test, and input/output TDS test.', 349, 45, ARRAY['TDS input & output measurement', 'Sediment bowl cleaning', 'Leakage detection'], ARRAY['Filter candles or membrane cost'])
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PROFILES
INSERT INTO profiles (id, email, full_name, phone, role)
VALUES
-- Customers
('u1000000-0000-0000-0000-000000000001', 'rahul.sharma@example.com', 'Rahul Sharma', '+91 98765 43210', 'customer'),
('u1000000-0000-0000-0000-000000000002', 'priya.patel@example.com', 'Priya Patel', '+91 98765 43211', 'customer'),

-- Service Providers
('p1000000-0000-0000-0000-000000000001', 'ramesh.electrician@example.com', 'Ramesh Kumar', '+91 91234 56789', 'provider'),
('p1000000-0000-0000-0000-000000000002', 'suresh.plumber@example.com', 'Suresh Hegde', '+91 91234 56790', 'provider'),
('p1000000-0000-0000-0000-000000000003', 'imran.acpro@example.com', 'Imran Khan', '+91 91234 56791', 'provider'),
('p1000000-0000-0000-0000-000000000004', 'manjunath.carpenter@example.com', 'Manjunath Swamy', '+91 91234 56792', 'provider'),

-- Admin
('a1000000-0000-0000-0000-000000000001', 'admin@fixnear.in', 'FixNear Administrator', '+91 99999 88888', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED CUSTOMER ADDRESSES
INSERT INTO customer_addresses (id, customer_id, title, street_address, landmark, city, state, postal_code, latitude, longitude, is_default)
VALUES
('d1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 'Home', 'Flat 402, Green Glen Layout, Bellandur', 'Near Sobha Carnation', 'Bengaluru', 'Karnataka', '560103', 12.9260, 77.6762, true),
('d1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000001', 'Office', '9th Main, 14th Cross, Indiranagar', 'Near Metro Station', 'Bengaluru', 'Karnataka', '560038', 12.9784, 77.6408, false)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED PROVIDER PROFILES
INSERT INTO provider_profiles (id, business_name, bio, experience_years, service_radius_km, base_latitude, base_longitude, verification_status, rating_avg, rating_count, total_completed_jobs, commission_rate_percent)
VALUES
('p1000000-0000-0000-0000-000000000001', 'Ramesh Electrical Works', 'Certified electrician with over 9 years of experience in domestic and commercial electrical installations in Bengaluru.', 9, 20.0, 12.9716, 77.5946, 'verified', 4.90, 48, 185, 15.0),
('p1000000-0000-0000-0000-000000000002', 'Hegde Plumbing Solutions', 'Expert master plumber specializing in high-pressure bathroom fittings, leak detection, and sanitary ware.', 12, 18.0, 12.9352, 77.6245, 'verified', 4.85, 34, 142, 15.0),
('p1000000-0000-0000-0000-000000000003', 'CoolCare HVAC Services', 'Licensed AC technician certified in Daikin, LG, and Voltas inverter systems. Clean foam servicing specialist.', 7, 25.0, 12.9141, 77.6534, 'verified', 4.95, 62, 210, 15.0),
('p1000000-0000-0000-0000-000000000004', 'Manju Woodcraft & Carpentry', 'Skilled carpenter with fine woodwork, modular kitchen hinge adjustments, and mortise lock experience.', 10, 15.0, 12.9800, 77.5800, 'verified', 4.78, 29, 95, 15.0)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED PROVIDER SERVICES
INSERT INTO provider_services (provider_id, service_id)
VALUES
('p1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001'),
('p1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002'),
('p1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000003'),
('p1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000004'),
('p1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000005'),
('p1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000006'),
('p1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000007'),
('p1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000008'),
('p1000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000009'),
('p1000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

-- 7. SEED PROVIDER AVAILABILITY (Mon-Sat 09:00 - 18:00)
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
VALUES
('p1000000-0000-0000-0000-000000000001', 1, '09:00', '18:00'),
('p1000000-0000-0000-0000-000000000001', 2, '09:00', '18:00'),
('p1000000-0000-0000-0000-000000000001', 3, '09:00', '18:00'),
('p1000000-0000-0000-0000-000000000001', 4, '09:00', '18:00'),
('p1000000-0000-0000-0000-000000000001', 5, '09:00', '18:00'),
('p1000000-0000-0000-0000-000000000001', 6, '09:00', '18:00'),
('p1000000-0000-0000-0000-000000000003', 1, '08:30', '19:00'),
('p1000000-0000-0000-0000-000000000003', 2, '08:30', '19:00'),
('p1000000-0000-0000-0000-000000000003', 3, '08:30', '19:00'),
('p1000000-0000-0000-0000-000000000003', 4, '08:30', '19:00'),
('p1000000-0000-0000-0000-000000000003', 5, '08:30', '19:00')
ON CONFLICT DO NOTHING;

-- 8. SEED A COMPLETED BOOKING + REVIEW FOR REALISTIC METRICS
INSERT INTO bookings (
    id, booking_reference, customer_id, provider_id, service_id, address_id,
    status, scheduled_date, scheduled_time_slot, problem_description,
    estimated_price_inr, final_price_inr, platform_fee_inr, provider_payout_inr,
    payment_status
) VALUES (
    'b1000000-0000-0000-0000-000000000001',
    'FIX-2026-8812',
    'u1000000-0000-0000-0000-000000000001',
    'p1000000-0000-0000-0000-000000000003',
    's1000000-0000-0000-0000-000000000007',
    'd1000000-0000-0000-0000-000000000001',
    'completed',
    CURRENT_DATE - INTERVAL '3 days',
    '10:00 AM - 12:00 PM',
    'Master bedroom AC is cooling very slowly and making a whistling noise.',
    599, 599, 49, 510,
    'paid'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, booking_id, customer_id, provider_id, rating, comment, response_from_provider)
VALUES (
    'r1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000001',
    'p1000000-0000-0000-0000-000000000003',
    5,
    'Imran did a fantastic job with our split AC! Jet wash cleaned all the dust and cooling was restored within minutes. Very punctual and respectful pro.',
    'Thank you so much Rahul! Glad to assist you with quick cooling.'
) ON CONFLICT (id) DO NOTHING;
