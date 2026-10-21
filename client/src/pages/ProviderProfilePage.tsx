import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ProviderProfile } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiRequest<ProviderProfile>(`/providers/${id}`)
      .then((res) => {
        if (res.success) setProvider(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-64 bg-stone-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-stone-900">Professional Not Found</h2>
        <Link to="/services">
          <Button variant="outline" size="sm" className="mt-4">
            Browse Services
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profile Hero */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80"
              alt={provider.business_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-brand-500 shadow-md"
            />
            {provider.verification_status === 'verified' && (
              <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-1.5 rounded-full shadow" title="Verified Background">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-stone-900">{provider.business_name}</h1>
              {provider.verification_status === 'verified' && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified Pro
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Bengaluru Coverage (Serving up to {provider.service_radius_km} km radius)
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-stone-600">
              <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {provider.rating_avg} ({provider.rating_count} reviews)
              </span>
              <span>•</span>
              <span>{provider.experience_years} years in field</span>
              <span>•</span>
              <span>{provider.total_completed_jobs} completed bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Services Offered Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
            <h3 className="font-bold text-stone-900 text-base mb-2">About the Professional</h3>
            <p className="text-sm text-stone-700 leading-relaxed">{provider.bio}</p>
          </div>

          {/* Services offered by this provider */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Offered Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provider.services && provider.services.length > 0 ? (
                provider.services.map((srv) => (
                  <Card key={srv.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm mb-1">{srv.name}</h4>
                      <p className="text-xs text-stone-600 line-clamp-2">{srv.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                      <span className="font-bold text-stone-900 text-sm">₹{srv.base_price_inr}</span>
                      <Link to={`/services/${srv.slug}`}>
                        <Button size="sm">Book Service</Button>
                      </Link>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-stone-500">Available across all primary catalog services.</p>
              )}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Customer Reviews ({provider.reviews?.length || 0})</span>
            </h3>

            {provider.reviews && provider.reviews.length > 0 ? (
              <div className="space-y-3">
                {provider.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-stone-900">{rev.customer_name || 'Customer'}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400">Verified Service</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed italic">"{rev.comment}"</p>
                    {rev.response_from_provider && (
                      <div className="bg-brand-50/60 p-2.5 rounded-lg border border-brand-100 text-[11px] text-brand-900 mt-2">
                        <span className="font-semibold block">Response from Pro:</span>
                        {rev.response_from_provider}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 bg-surface-50 p-4 rounded-xl">
                No public reviews submitted yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="font-bold text-stone-900 text-sm mb-3">FixNear Verification Trust</h4>
            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>Govt ID (Aadhaar / PAN) checked & recorded</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>Trade skills and experience assessment passed</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>30-day service warranty on all completed jobs</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
