import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  ArrowRight,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ServiceCategory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const BecomeAPro: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, switchRole } = useAuth();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [serviceRadius, setServiceRadius] = useState(15);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState('aadhaar');
  const [documentUrl, setDocumentUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ServiceCategory[]>('/categories').then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !bio.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest(
        '/providers/onboarding',
        {
          method: 'POST',
          body: JSON.stringify({
            business_name: businessName,
            bio,
            experience_years: experienceYears,
            service_radius_km: serviceRadius,
            base_city: 'Bengaluru',
            service_ids: selectedServiceIds.length > 0 ? selectedServiceIds : ['s1000000-0000-0000-0000-000000000001'],
            document_type: documentType,
            document_url: documentUrl,
          }),
        },
        currentUser.id
      );

      if (res.success) {
        setSuccessMessage('Application submitted successfully! Your profile is pending administrative review.');
        switchRole('provider');
        setTimeout(() => {
          navigate('/provider/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-8 sm:p-12">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-950/80 px-3 py-1 rounded-full border border-brand-800/80">
            FixNear Partner Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Earn more. Keep 85%. Work on your own terms.
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            Join Bengaluru's premier network of independent electricians, plumbers, HVAC technicians, and carpenters. Direct customer leads, zero marketing costs, and reliable weekly payouts.
          </p>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-brand-600">
          <DollarSign className="w-8 h-8 text-brand-600 mb-3" />
          <h3 className="font-bold text-stone-900 text-base mb-1">Guaranteed 85% Payout</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We charge a flat 15% platform commission on completed jobs. No annual subscription fees or bidding paywalls.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-600">
          <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-stone-900 text-base mb-1">Verified Pro Status</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Get the FixNear Verified Partner Badge on your profile once your ID and trade skills are checked, unlocking 3x more bookings.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500">
          <TrendingUp className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-bold text-stone-900 text-base mb-1">Flexibility & Control</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Set your own active hours and service radius in Bengaluru. Accept only the jobs that match your schedule.
          </p>
        </Card>
      </div>

      {/* Onboarding Application Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-card space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Partner Application Form</h2>
          <p className="text-xs text-stone-500 mt-1">Submit your business profile and credentials for administrative review</p>
        </div>

        {successMessage ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-base">Application Received</h4>
            <p className="text-xs text-emerald-800">{successMessage}</p>
            <p className="text-xs text-stone-500">Redirecting to your Partner Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOnboarding} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Business / Trade Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Indiranagar Master Plumbing & Sanitary Works"
                className="w-full rounded-lg border border-stone-300 p-2.5 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Professional Bio & Experience *</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your skills, past projects, certifications, and years of experience..."
                className="w-full rounded-lg border border-stone-300 p-2.5 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-stone-300 p-2.5 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Service Coverage Radius (km)</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(parseInt(e.target.value) || 15)}
                  className="w-full rounded-lg border border-stone-300 p-2.5 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Verification Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5 focus:border-brand-500 focus:outline-none"
                >
                  <option value="aadhaar">Aadhaar Card (Govt of India)</option>
                  <option value="pan">PAN Card</option>
                  <option value="trade_license">Trade License / ITI Diploma</option>
                  <option value="police_clearance">Police Verification Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Document Link / URL *</label>
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-stone-300 p-2.5 focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                Submit Application for Verification
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
