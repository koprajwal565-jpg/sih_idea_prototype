import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabase: SupabaseClient | null = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(' Connected to real Supabase backend.');
  } catch (err) {
    console.warn('⚠️ Supabase client initialization error, falling back to local memory store:', err);
  }
} else {
  console.log('ℹ️ Running with FixNear Local In-Memory Data Store (seeded with Bangalore services & providers).');
}

export { supabase };

// ----------------------------------------------------
// Typed In-Memory Storage for Development / Demos / Tests
// ----------------------------------------------------
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  title: string;
  street_address: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
}

export interface ProviderProfile {
  id: string;
  business_name: string;
  bio: string;
  experience_years: number;
  service_radius_km: number;
  base_latitude: number;
  base_longitude: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
  total_completed_jobs: number;
  commission_rate_percent: number;
  full_name?: string;
  phone?: string;
  email?: string;
}

export interface ProviderDocument {
  id: string;
  provider_id: string;
  document_type: string;
  document_url: string;
  file_name: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  base_price_inr: number;
  duration_minutes: number;
  inclusions: string[];
  exclusions: string[];
  is_active: boolean;
  category_name?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  customer_id: string;
  provider_id?: string;
  service_id: string;
  address_id: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'provider_assigned'
    | 'provider_en_route'
    | 'in_progress'
    | 'completed'
    | 'cancellation_requested'
    | 'cancelled'
    | 'disputed';
  scheduled_date: string;
  scheduled_time_slot: string;
  problem_description: string;
  estimated_price_inr: number;
  final_price_inr: number;
  platform_fee_inr: number;
  provider_payout_inr: number;
  payment_status: 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Hydrated joins
  service?: ServiceItem;
  customer?: Profile;
  provider?: ProviderProfile;
  address?: CustomerAddress;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  from_status?: string;
  to_status: string;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount_inr: number;
  currency: string;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  method: string;
  is_demo: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

export interface ReviewItem {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  response_from_provider?: string;
  created_at: string;
  customer_name?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string;
  target_id?: string;
  details: Record<string, any>;
  created_at: string;
}

// ----------------------------------------------------
// Memory Database Singleton seeded with 004_seed_data
// ----------------------------------------------------
class MemoryDatabase {
  profiles: Profile[] = [
    {
      id: 'u1000000-0000-0000-0000-000000000001',
      email: 'rahul.sharma@example.com',
      full_name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      role: 'customer',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
    {
      id: 'u1000000-0000-0000-0000-000000000002',
      email: 'priya.patel@example.com',
      full_name: 'Priya Patel',
      phone: '+91 98765 43211',
      role: 'customer',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p1000000-0000-0000-0000-000000000001',
      email: 'ramesh.electrician@example.com',
      full_name: 'Ramesh Kumar',
      phone: '+91 91234 56789',
      role: 'provider',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p1000000-0000-0000-0000-000000000002',
      email: 'suresh.plumber@example.com',
      full_name: 'Suresh Hegde',
      phone: '+91 91234 56790',
      role: 'provider',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p1000000-0000-0000-0000-000000000003',
      email: 'imran.acpro@example.com',
      full_name: 'Imran Khan',
      phone: '+91 91234 56791',
      role: 'provider',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p1000000-0000-0000-0000-000000000004',
      email: 'manjunath.carpenter@example.com',
      full_name: 'Manjunath Swamy',
      phone: '+91 91234 56792',
      role: 'provider',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
    {
      id: 'a1000000-0000-0000-0000-000000000001',
      email: 'admin@fixnear.in',
      full_name: 'FixNear Administrator',
      phone: '+91 99999 88888',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      created_at: new Date().toISOString(),
    },
  ];

  addresses: CustomerAddress[] = [
    {
      id: 'd1000000-0000-0000-0000-000000000001',
      customer_id: 'u1000000-0000-0000-0000-000000000001',
      title: 'Home',
      street_address: 'Flat 402, Green Glen Layout, Bellandur',
      landmark: 'Near Sobha Carnation',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560103',
      latitude: 12.926,
      longitude: 77.6762,
      is_default: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'd1000000-0000-0000-0000-000000000002',
      customer_id: 'u1000000-0000-0000-0000-000000000001',
      title: 'Office',
      street_address: '9th Main, 14th Cross, Indiranagar',
      landmark: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      is_default: false,
      created_at: new Date().toISOString(),
    },
  ];

  providerProfiles: ProviderProfile[] = [
    {
      id: 'p1000000-0000-0000-0000-000000000001',
      full_name: 'Ramesh Kumar',
      email: 'ramesh.electrician@example.com',
      phone: '+91 91234 56789',
      business_name: 'Ramesh Electrical Works',
      bio: 'Certified electrician with over 9 years of experience in domestic and commercial electrical installations in Bengaluru.',
      experience_years: 9,
      service_radius_km: 20.0,
      base_latitude: 12.9716,
      base_longitude: 77.5946,
      verification_status: 'verified',
      is_available: true,
      rating_avg: 4.9,
      rating_count: 48,
      total_completed_jobs: 185,
      commission_rate_percent: 15.0,
    },
    {
      id: 'p1000000-0000-0000-0000-000000000002',
      full_name: 'Suresh Hegde',
      email: 'suresh.plumber@example.com',
      phone: '+91 91234 56790',
      business_name: 'Hegde Plumbing Solutions',
      bio: 'Expert master plumber specializing in high-pressure bathroom fittings, leak detection, and sanitary ware.',
      experience_years: 12,
      service_radius_km: 18.0,
      base_latitude: 12.9352,
      base_longitude: 77.6245,
      verification_status: 'verified',
      is_available: true,
      rating_avg: 4.85,
      rating_count: 34,
      total_completed_jobs: 142,
      commission_rate_percent: 15.0,
    },
    {
      id: 'p1000000-0000-0000-0000-000000000003',
      full_name: 'Imran Khan',
      email: 'imran.acpro@example.com',
      phone: '+91 91234 56791',
      business_name: 'CoolCare HVAC Services',
      bio: 'Licensed AC technician certified in Daikin, LG, and Voltas inverter systems. Clean foam servicing specialist.',
      experience_years: 7,
      service_radius_km: 25.0,
      base_latitude: 12.9141,
      base_longitude: 77.6534,
      verification_status: 'verified',
      is_available: true,
      rating_avg: 4.95,
      rating_count: 62,
      total_completed_jobs: 210,
      commission_rate_percent: 15.0,
    },
    {
      id: 'p1000000-0000-0000-0000-000000000004',
      full_name: 'Manjunath Swamy',
      email: 'manjunath.carpenter@example.com',
      phone: '+91 91234 56792',
      business_name: 'Manju Woodcraft & Carpentry',
      bio: 'Skilled carpenter with fine woodwork, modular kitchen hinge adjustments, and mortise lock experience.',
      experience_years: 10,
      service_radius_km: 15.0,
      base_latitude: 12.98,
      base_longitude: 77.58,
      verification_status: 'pending',
      is_available: true,
      rating_avg: 4.78,
      rating_count: 29,
      total_completed_jobs: 95,
      commission_rate_percent: 15.0,
    },
  ];

  providerDocuments: ProviderDocument[] = [
    {
      id: 'doc-001',
      provider_id: 'p1000000-0000-0000-0000-000000000004',
      document_type: 'aadhaar',
      document_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      file_name: 'aadhaar_card_manjunath.pdf',
      verification_status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'doc-002',
      provider_id: 'p1000000-0000-0000-0000-000000000004',
      document_type: 'trade_license',
      document_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      file_name: 'carpentry_mastery_certificate.pdf',
      verification_status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];

  categories: ServiceCategory[] = [
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Electrician',
      slug: 'electrician',
      description: 'Expert electrical repairs, wiring, switches, fans, and appliance installations.',
      icon_name: 'Zap',
      display_order: 1,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Tap leakage, wash basin, pipe fitting, water tank, and bathroom fittings.',
      icon_name: 'Droplet',
      display_order: 2,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000003',
      name: 'AC & Appliance Repair',
      slug: 'ac-appliances',
      description: 'AC servicing, refrigerator, microwave, and washing machine repairs.',
      icon_name: 'Wind',
      display_order: 3,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000004',
      name: 'Carpentry',
      slug: 'carpentry',
      description: 'Door lock installation, furniture assembly, hinges, and woodwork.',
      icon_name: 'Hammer',
      display_order: 4,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000005',
      name: 'House Cleaning',
      slug: 'cleaning',
      description: 'Deep home cleaning, sparkling bathroom, kitchen degreasing, and sofa care.',
      icon_name: 'Sparkles',
      display_order: 5,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000006',
      name: 'Painting & Waterproofing',
      slug: 'painting',
      description: 'Interior wall painting, touchups, exterior coatings, and damp proofing.',
      icon_name: 'Paintbrush',
      display_order: 6,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000007',
      name: 'Pest Control',
      slug: 'pest-control',
      description: 'Eco-friendly pest treatment for cockroaches, termites, bedbugs, and rodents.',
      icon_name: 'ShieldAlert',
      display_order: 7,
      is_active: true,
    },
    {
      id: 'c1000000-0000-0000-0000-000000000008',
      name: 'RO & Water Purifier',
      slug: 'ro-water-purifier',
      description: 'Water filter service, sediment filter change, RO membrane, and TDS check.',
      icon_name: 'ShieldCheck',
      display_order: 8,
      is_active: true,
    },
  ];

  services: ServiceItem[] = [
    {
      id: 's1000000-0000-0000-0000-000000000001',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      category_name: 'Electrician',
      name: 'Ceiling Fan Installation & Repair',
      slug: 'fan-install-repair',
      description: 'Complete inspection, balancing, capacitor check, and secure hanging of ceiling fans.',
      base_price_inr: 199,
      duration_minutes: 45,
      inclusions: ['Capacitor check', 'Secure ceiling bracket fitting', 'Blade balancing', 'Post-service test'],
      exclusions: ['New fan or spare parts cost', 'Concealed wiring rerouting'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000002',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      category_name: 'Electrician',
      name: 'Switchboard Repair & Replacement',
      slug: 'switchboard-repair',
      description: 'Repair or replacement of damaged switches, sockets, regulators, or MCB trips.',
      base_price_inr: 149,
      duration_minutes: 30,
      inclusions: ['Diagnosis of short circuits', 'Socket/Switch replacement', 'Earthing check'],
      exclusions: ['Cost of replacement switches/plates'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000003',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      category_name: 'Electrician',
      name: 'Inverter & Battery Setup / Checkup',
      slug: 'inverter-battery-setup',
      description: 'Complete inverter installation, battery water top-up, wiring connection, and load test.',
      base_price_inr: 499,
      duration_minutes: 60,
      inclusions: ['Inverter cabling', 'Battery terminal grease & cleaning', 'Load balancing test'],
      exclusions: ['Inverter or battery unit', 'External heavy-duty cables'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000004',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      category_name: 'Plumbing',
      name: 'Tap & Mixer Leakage Repair',
      slug: 'tap-mixer-repair',
      description: 'Fix dripping taps, loose handles, cartridge replacement, or wall mixer installations.',
      base_price_inr: 149,
      duration_minutes: 30,
      inclusions: ['Washer/cartridge replacement', 'Teflon tape sealing', 'Pressure check'],
      exclusions: ['Cost of new taps/spares'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000005',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      category_name: 'Plumbing',
      name: 'Drain Blockage Removal',
      slug: 'drain-blockage-removal',
      description: 'Clearing kitchen sink, bathroom trap, or balcony floor drain blockages using drain auger.',
      base_price_inr: 299,
      duration_minutes: 45,
      inclusions: ['Chemical-safe unclogging', 'Debris removal', 'High-flow water test'],
      exclusions: ['Major underground pipe replacement'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000006',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      category_name: 'Plumbing',
      name: 'Toilet Flush Tank Repair',
      slug: 'toilet-flush-repair',
      description: 'Repair or replacement of siphon valve, ball valve, push button, or internal float.',
      base_price_inr: 249,
      duration_minutes: 40,
      inclusions: ['Flush mechanism inspection', 'Leak prevention', 'Water level adjustment'],
      exclusions: ['New flush tank unit'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000007',
      category_id: 'c1000000-0000-0000-0000-000000000003',
      category_name: 'AC & Appliance Repair',
      name: 'Split AC Deep Foam Cleaning',
      slug: 'split-ac-foam-cleaning',
      description: 'Power jet cleaning of indoor cooling coils, blower, outdoor unit cleaning, and gas check.',
      base_price_inr: 599,
      duration_minutes: 60,
      inclusions: ['Indoor unit foam spray & wash', 'Blower & tray deep cleaning', 'Outdoor unit jet spray', 'Gas pressure diagnosis'],
      exclusions: ['Gas recharge cost (if low)', 'Spare parts'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000008',
      category_id: 'c1000000-0000-0000-0000-000000000003',
      category_name: 'AC & Appliance Repair',
      name: 'Washing Machine Diagnosis & Service',
      slug: 'washing-machine-service',
      description: 'Diagnosis of spin errors, drainage issues, drum noise, or motor malfunction.',
      base_price_inr: 299,
      duration_minutes: 45,
      inclusions: ['Full diagnostic report', 'Filter and inlet valve cleaning', 'Vibration leveling check'],
      exclusions: ['Spare motor or PCB replacement'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000009',
      category_id: 'c1000000-0000-0000-0000-000000000004',
      category_name: 'Carpentry',
      name: 'Door Lock & Latch Installation',
      slug: 'door-lock-installation',
      description: 'Fitting mortise locks, cylinder locks, pad latches, or magnetic door stoppers.',
      base_price_inr: 249,
      duration_minutes: 45,
      inclusions: ['Precise wood chiseling & drilling', 'Lock mechanism alignment', 'Smooth latch testing'],
      exclusions: ['Lock hardware cost'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000010',
      category_id: 'c1000000-0000-0000-0000-000000000004',
      category_name: 'Carpentry',
      name: 'Furniture Assembly (Bed/Table/Wardrobe)',
      slug: 'furniture-assembly',
      description: 'Professional assembly of flat-pack furniture (IKEA, Urban Ladder, Pepperfry).',
      base_price_inr: 499,
      duration_minutes: 90,
      inclusions: ['Structural alignment', 'Hardware bolt torquing', 'Stability leveling'],
      exclusions: ['Wall anchoring hardware (if unprovided)'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000011',
      category_id: 'c1000000-0000-0000-0000-000000000005',
      category_name: 'House Cleaning',
      name: 'Intense Bathroom Deep Cleaning',
      slug: 'bathroom-deep-cleaning',
      description: 'Descaling hard water stains from tiles, glass partitions, taps, basin, and WC disinfection.',
      base_price_inr: 449,
      duration_minutes: 60,
      inclusions: ['Tile scrubbing with machine', 'Limescale removal on chrome taps', 'Toilet bowl sanitization', 'Mirror and counter wipe'],
      exclusions: ['Wall paint scrubbing'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000012',
      category_id: 'c1000000-0000-0000-0000-000000000005',
      category_name: 'House Cleaning',
      name: 'Complete Kitchen Degreasing & Cleaning',
      slug: 'kitchen-cleaning',
      description: 'Degreasing chimney exterior, gas stove, tile backsplash, countertop, and cabinet exterior.',
      base_price_inr: 999,
      duration_minutes: 120,
      inclusions: ['Heavy grease remover treatment', 'Exhaust & stove scrubbing', 'Floor wash with disinfectant'],
      exclusions: ['Interior utensil rearrangement'],
      is_active: true,
    },
    {
      id: 's1000000-0000-0000-0000-000000000013',
      category_id: 'c1000000-0000-0000-0000-000000000008',
      category_name: 'RO & Water Purifier',
      name: 'RO Purifier Complete Service & TDS Check',
      slug: 'ro-purifier-service',
      description: 'Sediment bowl flush, carbon filter check, pump pressure test, and input/output TDS test.',
      base_price_inr: 349,
      duration_minutes: 45,
      inclusions: ['TDS input & output measurement', 'Sediment bowl cleaning', 'Leakage detection'],
      exclusions: ['Filter candles or membrane cost'],
      is_active: true,
    },
  ];

  providerServiceMap: { provider_id: string; service_id: string }[] = [
    { provider_id: 'p1000000-0000-0000-0000-000000000001', service_id: 's1000000-0000-0000-0000-000000000001' },
    { provider_id: 'p1000000-0000-0000-0000-000000000001', service_id: 's1000000-0000-0000-0000-000000000002' },
    { provider_id: 'p1000000-0000-0000-0000-000000000001', service_id: 's1000000-0000-0000-0000-000000000003' },
    { provider_id: 'p1000000-0000-0000-0000-000000000002', service_id: 's1000000-0000-0000-0000-000000000004' },
    { provider_id: 'p1000000-0000-0000-0000-000000000002', service_id: 's1000000-0000-0000-0000-000000000005' },
    { provider_id: 'p1000000-0000-0000-0000-000000000002', service_id: 's1000000-0000-0000-0000-000000000006' },
    { provider_id: 'p1000000-0000-0000-0000-000000000003', service_id: 's1000000-0000-0000-0000-000000000007' },
    { provider_id: 'p1000000-0000-0000-0000-000000000003', service_id: 's1000000-0000-0000-0000-000000000008' },
    { provider_id: 'p1000000-0000-0000-0000-000000000004', service_id: 's1000000-0000-0000-0000-000000000009' },
    { provider_id: 'p1000000-0000-0000-0000-000000000004', service_id: 's1000000-0000-0000-0000-000000000010' },
  ];

  bookings: Booking[] = [
    {
      id: 'b1000000-0000-0000-0000-000000000001',
      booking_reference: 'FIX-2026-8812',
      customer_id: 'u1000000-0000-0000-0000-000000000001',
      provider_id: 'p1000000-0000-0000-0000-000000000003',
      service_id: 's1000000-0000-0000-0000-000000000007',
      address_id: 'd1000000-0000-0000-0000-000000000001',
      status: 'completed',
      scheduled_date: '2026-10-18',
      scheduled_time_slot: '10:00 AM - 12:00 PM',
      problem_description: 'Master bedroom AC is cooling very slowly and making a whistling noise.',
      estimated_price_inr: 599,
      final_price_inr: 599,
      platform_fee_inr: 49,
      provider_payout_inr: 510,
      payment_status: 'paid',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'b1000000-0000-0000-0000-000000000002',
      booking_reference: 'FIX-2026-9044',
      customer_id: 'u1000000-0000-0000-0000-000000000001',
      provider_id: 'p1000000-0000-0000-0000-000000000001',
      service_id: 's1000000-0000-0000-0000-000000000001',
      address_id: 'd1000000-0000-0000-0000-000000000001',
      status: 'confirmed',
      scheduled_date: '2026-10-23',
      scheduled_time_slot: '02:00 PM - 04:00 PM',
      problem_description: 'Living room fan wobbling violently at speed 4 and 5.',
      estimated_price_inr: 199,
      final_price_inr: 199,
      platform_fee_inr: 49,
      provider_payout_inr: 170,
      payment_status: 'paid',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  bookingHistory: BookingStatusHistory[] = [
    {
      id: 'h-01',
      booking_id: 'b1000000-0000-0000-0000-000000000001',
      from_status: undefined,
      to_status: 'pending',
      notes: 'Initial booking request submitted',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'h-02',
      booking_id: 'b1000000-0000-0000-0000-000000000001',
      from_status: 'pending',
      to_status: 'confirmed',
      notes: 'Payment received via Razorpay',
      created_at: new Date(Date.now() - 3 * 86400000 + 120000).toISOString(),
    },
    {
      id: 'h-03',
      booking_id: 'b1000000-0000-0000-0000-000000000001',
      from_status: 'confirmed',
      to_status: 'completed',
      notes: 'Service successfully executed by Imran Khan',
      created_at: new Date(Date.now() - 3 * 86400000 + 7200000).toISOString(),
    },
  ];

  payments: PaymentRecord[] = [
    {
      id: 'pay-001',
      booking_id: 'b1000000-0000-0000-0000-000000000001',
      user_id: 'u1000000-0000-0000-0000-000000000001',
      razorpay_order_id: 'order_test_9837194719',
      razorpay_payment_id: 'pay_test_0918239103',
      razorpay_signature: 'sig_mock_verified_signature_123',
      amount_inr: 648, // 599 service + 49 platform
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      is_demo: false,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'pay-002',
      booking_id: 'b1000000-0000-0000-0000-000000000002',
      user_id: 'u1000000-0000-0000-0000-000000000001',
      razorpay_order_id: 'order_test_9837194720',
      razorpay_payment_id: 'pay_test_0918239104',
      razorpay_signature: 'sig_mock_verified_signature_124',
      amount_inr: 248, // 199 service + 49 platform
      currency: 'INR',
      status: 'captured',
      method: 'demo',
      is_demo: true,
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  reviews: ReviewItem[] = [
    {
      id: 'r1000000-0000-0000-0000-000000000001',
      booking_id: 'b1000000-0000-0000-0000-000000000001',
      customer_id: 'u1000000-0000-0000-0000-000000000001',
      provider_id: 'p1000000-0000-0000-0000-000000000003',
      customer_name: 'Rahul Sharma',
      rating: 5,
      comment: 'Imran did a fantastic job with our split AC! Jet wash cleaned all the dust and cooling was restored within minutes. Very punctual and respectful pro.',
      response_from_provider: 'Thank you so much Rahul! Glad to assist you with quick cooling.',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  notifications: NotificationItem[] = [
    {
      id: 'notif-001',
      user_id: 'u1000000-0000-0000-0000-000000000001',
      title: 'Booking Confirmed!',
      message: 'Your booking FIX-2026-9044 for Ceiling Fan Repair is scheduled for Oct 23 at 02:00 PM.',
      type: 'booking_status',
      is_read: false,
      related_entity_type: 'booking',
      related_entity_id: 'b1000000-0000-0000-0000-000000000002',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'notif-002',
      user_id: 'p1000000-0000-0000-0000-000000000001',
      title: 'New Service Request',
      message: 'New confirmed job FIX-2026-9044 in Bellandur, Bengaluru.',
      type: 'provider_request',
      is_read: false,
      related_entity_type: 'booking',
      related_entity_id: 'b1000000-0000-0000-0000-000000000002',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  auditLogs: AdminAuditLog[] = [
    {
      id: 'log-001',
      admin_id: 'a1000000-0000-0000-0000-000000000001',
      action: 'APPROVE_PROVIDER',
      target_table: 'provider_profiles',
      target_id: 'p1000000-0000-0000-0000-000000000001',
      details: { verification_status: 'verified', notes: 'Aadhaar & trade credentials verified' },
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ];
}

export const db = new MemoryDatabase();
