import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  User,
  Power,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Booking, ProviderProfile } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!currentUser) return;
    try {
      const res = await apiRequest('/providers/me/dashboard', {}, currentUser.id);
      if (res.success) {
        setDashboardData(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentUser?.id]);

  const handleUpdateStatus = async (bookingId: string, nextStatus: string) => {
    if (!currentUser) return;
    setIsUpdatingStatus(bookingId);
    try {
      const res = await apiRequest(
        `/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus }),
        },
        currentUser.id
      );

      if (res.success) {
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-64 bg-stone-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const profile: ProviderProfile = dashboardData?.profile || currentUser;
  const metrics = dashboardData?.metrics || {
    total_completed_jobs: 0,
    rating_avg: 5.0,
    rating_count: 0,
    total_gross_inr: 0,
    total_commission_inr: 0,
    total_net_earnings_inr: 0,
  };

  const incomingRequests: Booking[] = dashboardData?.incoming_requests || [];
  const activeJobs: Booking[] = dashboardData?.active_jobs || [];
  const completedJobs: Booking[] = dashboardData?.completed_jobs || [];

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80'}
              alt={profile.business_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
            />
            {profile.verification_status === 'verified' && (
              <div className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1 rounded-full shadow-xs" title="Verified Professional">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">{profile.business_name || currentUser.full_name}</h1>
              {profile.verification_status === 'verified' ? (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified Partner
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Bengaluru Coverage (Radius: {profile.service_radius_km || 15} km) • {profile.experience_years || 5} yrs experience
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 bg-surface-100 p-2 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-stone-800">Status: Available for Jobs</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-brand-600">
          <span className="text-xs text-stone-500 font-medium">Net Payout Earnings</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">₹{metrics.total_net_earnings_inr}</p>
          <span className="text-[11px] text-emerald-600 block mt-1">85% after 15% platform fee</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-600">
          <span className="text-xs text-stone-500 font-medium">Gross Job Volume</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">₹{metrics.total_gross_inr}</p>
          <span className="text-[11px] text-stone-500 block mt-1">Total customer invoices</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs text-stone-500 font-medium">Customer Rating</span>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="text-2xl font-extrabold text-stone-900">{metrics.rating_avg}</span>
            <span className="text-xs text-stone-500">({metrics.rating_count} reviews)</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600">
          <span className="text-xs text-stone-500 font-medium">Completed Jobs</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{metrics.total_completed_jobs}</p>
          <span className="text-[11px] text-stone-500 block mt-1">100% on-time guarantee</span>
        </Card>
      </div>

      {/* Incoming Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>Incoming Booking Requests</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              {incomingRequests.length}
            </span>
          </h2>
        </div>

        {incomingRequests.length === 0 ? (
          <p className="text-xs text-stone-500 bg-white p-6 rounded-xl border border-stone-200">
            No incoming pending requests right now. You will receive an instant notification when a customer books your service.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map((job) => (
              <Card key={job.id} className="p-5 border-amber-300 bg-amber-50/20">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="font-mono font-bold text-xs text-stone-900">{job.booking_reference}</span>
                  <StatusBadge status={job.status} />
                </div>

                <div className="py-3 space-y-1.5 text-xs text-stone-700">
                  <h4 className="font-bold text-stone-900 text-sm">{job.service?.name}</h4>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{job.scheduled_date} ({job.scheduled_time_slot})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{job.address?.street_address || 'Bellandur, Bengaluru'}</span>
                  </div>
                  <p className="bg-white p-2 rounded border border-stone-200 mt-2 italic text-stone-600">
                    "{job.problem_description}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Your Payout</span>
                    <span className="text-base font-bold text-brand-700">₹{job.provider_payout_inr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      isLoading={isUpdatingStatus === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'provider_assigned')}
                    >
                      Accept Job
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs in Progress Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <span>Active Dispatches & Ongoing Work</span>
          <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
            {activeJobs.length}
          </span>
        </h2>

        {activeJobs.length === 0 ? (
          <p className="text-xs text-stone-500 bg-white p-6 rounded-xl border border-stone-200">
            No active jobs in transit or in progress right now.
          </p>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <Card key={job.id} className="p-6 border-brand-300">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900">{job.booking_reference}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <span className="text-sm font-bold text-brand-700">Payout: ₹{job.provider_payout_inr}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs text-stone-700">
                  <div>
                    <span className="text-stone-400 block mb-0.5">Customer & Phone</span>
                    <span className="font-semibold text-stone-900 block text-sm">{job.customer?.full_name || 'Rahul Sharma'}</span>
                    <a href={`tel:${job.customer?.phone || '+919876543210'}`} className="text-brand-700 font-semibold inline-flex items-center gap-1 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {job.customer?.phone || '+91 98765 43210'}
                    </a>
                  </div>

                  <div>
                    <span className="text-stone-400 block mb-0.5">Service Address</span>
                    <span className="font-semibold text-stone-800 block">{job.address?.street_address}</span>
                    <span className="text-stone-500 block">{job.address?.landmark}, {job.address?.city}</span>
                  </div>

                  <div>
                    <span className="text-stone-400 block mb-0.5">Problem Reported</span>
                    <span className="text-stone-700 block italic">"{job.problem_description}"</span>
                  </div>
                </div>

                {/* Status action stepper buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                  {job.status === 'provider_assigned' && (
                    <Button
                      size="sm"
                      isLoading={isUpdatingStatus === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'provider_en_route')}
                    >
                      <Truck className="w-4 h-4 mr-1.5" />
                      Mark On The Way
                    </Button>
                  )}

                  {job.status === 'provider_en_route' && (
                    <Button
                      size="sm"
                      isLoading={isUpdatingStatus === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                    >
                      <PlayCircle className="w-4 h-4 mr-1.5" />
                      Arrived & Start Work
                    </Button>
                  )}

                  {job.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      isLoading={isUpdatingStatus === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'completed')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Mark Job Completed
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900">Completed Service Ledger</h2>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-surface-100 text-stone-700 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">Gross Invoice</th>
                  <th className="p-3.5">Commission (15%)</th>
                  <th className="p-3.5">Net Payout</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {completedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-stone-900">{job.booking_reference}</td>
                    <td className="p-3.5">{job.scheduled_date}</td>
                    <td className="p-3.5 font-medium text-stone-800">{job.service?.name}</td>
                    <td className="p-3.5 font-semibold text-stone-900">₹{job.estimated_price_inr}</td>
                    <td className="p-3.5 text-stone-500">₹{Math.round(job.estimated_price_inr * 0.15)}</td>
                    <td className="p-3.5 font-bold text-emerald-700">₹{job.provider_payout_inr}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
