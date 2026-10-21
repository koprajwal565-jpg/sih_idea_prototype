import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Search,
  Check,
  ChevronRight,
  Users,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ServiceCategory, ServiceItem, ProviderProfile } from '../types';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AIBookingModal } from '../components/ai/AIBookingModal';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [popularServices, setPopularServices] = useState<ServiceItem[]>([]);
  const [topProviders, setTopProviders] = useState<ProviderProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    // Fetch categories
    apiRequest<ServiceCategory[]>('/categories').then((res) => {
      if (res.success) setCategories(res.data);
    });

    // Fetch popular services
    apiRequest<ServiceItem[]>('/services').then((res) => {
      if (res.success) setPopularServices(res.data.slice(0, 6));
    });

    // Fetch verified providers
    apiRequest<ProviderProfile[]>('/providers').then((res) => {
      if (res.success) setTopProviders(res.data.slice(0, 4));
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-surface-50 to-surface-50 pt-12 pb-20 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-700" />
              <span>Bengaluru's Trusted On-Demand Home Services</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight">
              Quality home repairs,{' '}
              <span className="text-brand-600 underline decoration-brand-300 underline-offset-8">
                fixed right at your door.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Book certified plumbers, electricians, AC technicians, carpenters, and deep cleaners in Bengaluru with upfront transparent pricing and guaranteed arrival.
            </p>

            {/* Smart Search Bar */}
            <div className="max-w-2xl mx-auto pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white p-2 rounded-2xl shadow-soft border border-stone-200"
              >
                <Search className="w-5 h-5 text-stone-400 ml-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Describe your problem or service (e.g., tap leakage, split AC repair)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-sm text-stone-800 focus:outline-none placeholder:text-stone-400"
                />
                <Button type="submit" size="md">
                  Search
                </Button>
              </form>

              {/* AI Assistant Quick Pill */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-xs text-stone-500">Not sure what's broken?</span>
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 underline decoration-brand-400 underline-offset-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Ask our AI Assistant to diagnose your issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Explore Services</h2>
            <p className="text-sm text-stone-600 mt-1">Verified professionals ready for same-day dispatch across Bengaluru</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            <span>All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/services?category_slug=${cat.slug}`}
              className="group"
            >
              <Card
                hoverEffect
                className="p-5 flex flex-col items-center text-center h-full border border-stone-200 group-hover:border-brand-500 group-hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
                  <CategoryIcon name={cat.icon_name} className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-stone-900 text-sm sm:text-base group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">
                  {cat.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Services with Transparent Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Most Booked Services</h2>
            <p className="text-sm text-stone-600 mt-1">Fixed transparent pricing in INR with standard warranty</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            <span>View Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((service) => (
            <Card key={service.id} hoverEffect className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                    {service.category_name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration_minutes} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-stone-900 text-lg mb-2">
                  {service.name}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Key inclusions */}
                {service.inclusions && service.inclusions.length > 0 && (
                  <div className="space-y-1.5 mb-6 bg-surface-50 p-3 rounded-lg border border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-700 uppercase">Includes:</span>
                    {service.inclusions.slice(0, 2).map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                        <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div>
                  <span className="text-[11px] text-stone-500 block">Starting from</span>
                  <span className="text-xl font-bold text-stone-900">₹{service.base_price_inr}</span>
                </div>
                <Link to={`/services/${service.slug}`}>
                  <Button size="sm">
                    Book Now
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Rated Verified Service Professionals */}
      <section className="bg-surface-100/80 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Bengaluru's Best Craftsmen
            </span>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight mt-1">
              Top Rated Verified Professionals
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Every pro has completed physical background checks, Aadhaar/Govt ID verification, and has proven customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProviders.map((pro) => (
              <Card key={pro.id} className="p-5 flex flex-col justify-between text-center">
                <div>
                  <div className="relative inline-block mb-3">
                    <img
                      src={`https://images.unsplash.com/photo-${
                        pro.id === 'p1000000-0000-0000-0000-000000000001'
                          ? '1507003211169-0a1dd7228f2d'
                          : pro.id === 'p1000000-0000-0000-0000-000000000002'
                          ? '1500648767791-00dcc994a43e'
                          : pro.id === 'p1000000-0000-0000-0000-000000000003'
                          ? '1506794778202-cad84cf45f1d'
                          : '1472099645785-5658abf4ff4e'
                      }?auto=format&fit=crop&w=200&h=200&q=80`}
                      alt={pro.business_name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-brand-500 shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-1 rounded-full" title="Verified Pro">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>

                  <h4 className="font-bold text-stone-900 text-base">{pro.business_name}</h4>
                  <p className="text-xs text-stone-500 font-medium">{pro.experience_years} years experience</p>

                  <div className="flex items-center justify-center gap-1 my-3 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full w-max mx-auto text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{pro.rating_avg}</span>
                    <span className="text-amber-700 font-normal">({pro.rating_count} reviews)</span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {pro.bio}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{pro.total_completed_jobs} jobs done</span>
                  <Link
                    to={`/providers/${pro.id}`}
                    className="font-semibold text-brand-700 hover:text-brand-800"
                  >
                    View Profile →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Frictionless Booking
          </span>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight mt-1">
            How FixNear Works
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            From problem diagnosis to technician arrival in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Choose Service',
              desc: 'Select your needed service or let our AI diagnose your home repair issue.',
            },
            {
              step: '02',
              title: 'Pick Time Slot',
              desc: 'Choose your preferred date and convenient 2-hour arrival window.',
            },
            {
              step: '03',
              title: 'Verified Pro Arrives',
              desc: 'Vetted technician arrives equipped with genuine tools and parts.',
            },
            {
              step: '04',
              title: 'Inspect & Pay',
              desc: 'Pay securely via UPI, Card, or Demo Mode only when satisfied.',
            },
          ].map((item, i) => (
            <div key={i} className="relative p-6 bg-white rounded-2xl border border-stone-200">
              <span className="text-4xl font-extrabold text-brand-100 block mb-2">{item.step}</span>
              <h3 className="font-bold text-stone-900 text-base mb-2">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA For Service Providers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-800 text-brand-200 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>For Indian Technicians & Contractors</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Grow your independent business with FixNear.
            </h2>
            <p className="text-sm text-brand-100 leading-relaxed">
              Keep 85% of your earnings with direct weekly payouts, transparent jobs, and zero hidden platform membership fees.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link to="/become-a-pro">
              <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 border-none shadow-md">
                Register as a Professional
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Booking Assistant Modal */}
      <AIBookingModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};
