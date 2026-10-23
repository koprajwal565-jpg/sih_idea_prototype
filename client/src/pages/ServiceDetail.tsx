import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ServiceItem, ProviderProfile } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const initialIssue = searchParams.get('ai_issue') || '';

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking drawer / inline form state
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
  const [problemNotes, setProblemNotes] = useState(initialIssue || '');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiRequest<ServiceItem>(`/services/${slug}`)
      .then((res) => {
        if (res.success) {
          setService(res.data);
          if (res.data.eligible_providers && res.data.eligible_providers.length > 0) {
            setSelectedProviderId(res.data.eligible_providers[0].id);
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Service not found');
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/services/${slug}` } } });
      return;
    }

    if (!problemNotes.trim()) {
      alert('Please briefly describe the problem for the technician.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest(
        '/bookings',
        {
          method: 'POST',
          body: JSON.stringify({
            service_id: service.id,
            address_id: 'd1000000-0000-0000-0000-000000000001', // Indiranagar/Bellandur default
            provider_id: selectedProviderId || undefined,
            scheduled_date: selectedDate,
            scheduled_time_slot: selectedSlot,
            problem_description: problemNotes,
          }),
        },
        currentUser.id
      );

      if (res.success) {
        // Direct customer to payment confirmation in their dashboard
        navigate(`/customer/dashboard?highlight_booking=${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-xl mx-auto">
          <div className="h-8 bg-stone-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-stone-200 rounded w-1/2 mx-auto" />
          <div className="h-64 bg-stone-200 rounded mt-8" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-stone-900">Service Not Found</h2>
        <p className="text-sm text-stone-600 mt-1">{error || 'Could not locate the requested service catalog entry.'}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/services')}>
          Back to Services
        </Button>
      </div>
    );
  }

  const basePrice = service.base_price_inr;
  const platformFee = 49;
  const totalPrice = basePrice + platformFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Category Breadcrumb */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
          {service.category?.name || 'Home Maintenance'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-2">
          {service.name}
        </h1>
        <div className="flex items-center gap-4 text-xs text-stone-500 mt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>Estimated Duration: {service.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Bengaluru Metro Coverage</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Details, Inclusions, Verified Providers */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
            <h3 className="font-bold text-stone-900 text-lg mb-2">Service Overview</h3>
            <p className="text-sm text-stone-700 leading-relaxed">{service.description}</p>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200">
              <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What's Included</span>
              </h4>
              <ul className="space-y-2 text-xs text-emerald-800">
                {service.inclusions && service.inclusions.length > 0 ? (
                  service.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{inc}</span>
                    </li>
                  ))
                ) : (
                  <li>Standard diagnostics and equipment testing</li>
                )}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200">
              <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>What's Excluded</span>
              </h4>
              <ul className="space-y-2 text-xs text-rose-800">
                {service.exclusions && service.exclusions.length > 0 ? (
                  service.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{exc}</span>
                    </li>
                  ))
                ) : (
                  <li>Cost of replacement hardware / components</li>
                )}
              </ul>
            </div>
          </div>

          {/* Available Verified Technicians */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-lg">
              Available Verified Pros for this Service
            </h3>

            {service.eligible_providers && service.eligible_providers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.eligible_providers.map((pro) => (
                  <label
                    key={pro.id}
                    className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      selectedProviderId === pro.id
                        ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected_provider"
                      checked={selectedProviderId === pro.id}
                      onChange={() => setSelectedProviderId(pro.id)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-stone-900">
                          {pro.business_name}
                        </span>
                        <span title="Verified">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                        <span className="flex items-center text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                          {pro.rating_avg} ({pro.rating_count})
                        </span>
                        <span>•</span>
                        <span>{pro.experience_years} yrs exp</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 bg-surface-50 p-3 rounded-lg">
                Technician will be auto-assigned from our vetted on-call pool in your area.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Transparent Pricing Breakdown & Fast Booking Widget */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24 border-brand-200 shadow-soft">
            <h3 className="font-bold text-stone-900 text-base mb-4 flex items-center justify-between">
              <span>Transparent Price Summary</span>
              <span className="text-xs font-normal text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                INR (₹)
              </span>
            </h3>

            {/* Price list */}
            <div className="space-y-2.5 pb-4 border-b border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Base Service Rate</span>
                <span className="font-semibold text-stone-900">₹{basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Convenience Fee</span>
                <span className="font-semibold text-stone-900">₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Safety & Insurance Cover</span>
                <span className="font-semibold">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-stone-100">
              <span className="font-bold text-stone-900 text-sm">Total Payable</span>
              <span className="text-2xl font-extrabold text-brand-700">₹{totalPrice}</span>
            </div>

            {/* Fast Booking Form */}
            <form onSubmit={handleCreateBooking} className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 p-2 text-stone-800 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Arrival Slot
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 p-2 text-stone-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Describe Problem / Notes for Tech
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master bedroom tap leaking continuously from mixer joint..."
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 p-2 text-stone-800 focus:outline-none focus:border-brand-500 placeholder:text-stone-400"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                Proceed to Confirm & Pay
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>Razorpay Test & Demo Mode Enabled</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
