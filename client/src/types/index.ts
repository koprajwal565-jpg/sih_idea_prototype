export type UserRole = 'customer' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
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
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  base_price_inr: number;
  duration_minutes: number;
  inclusions: string[];
  exclusions: string[];
  is_active: boolean;
  category?: ServiceCategory;
  eligible_providers?: ProviderProfile[];
}

export interface ProviderProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
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
  services?: ServiceItem[];
  reviews?: ReviewItem[];
  documents?: ProviderDocument[];
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

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'provider_assigned'
  | 'provider_en_route'
  | 'in_progress'
  | 'completed'
  | 'cancellation_requested'
  | 'cancelled'
  | 'disputed';

export interface Booking {
  id: string;
  booking_reference: string;
  customer_id: string;
  provider_id?: string;
  service_id: string;
  address_id: string;
  status: BookingStatus;
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
  service?: ServiceItem;
  customer?: UserProfile;
  provider?: ProviderProfile;
  address?: CustomerAddress;
  history?: BookingStatusHistory[];
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  from_status?: string;
  to_status: string;
  notes?: string;
  changed_by?: string;
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
  customer_name?: string;
  provider_id: string;
  rating: number;
  comment: string;
  response_from_provider?: string;
  created_at: string;
}

export interface AdminMetrics {
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
  total_gmv_inr: number;
  platform_revenue_inr: number;
  total_providers: number;
  verified_providers: number;
  pending_verification: number;
  total_customers: number;
}
