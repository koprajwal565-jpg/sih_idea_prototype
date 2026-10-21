import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
          Simple, Reliable, Transparent
        </span>
        <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">
          How FixNear Works for Customers & Pros
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Whether you need an emergency electrical fix or want to book deep house cleaning, our transparent 4-step workflow guarantees safety, on-time arrivals, and standard rates.
        </p>
      </div>

      {/* Customer Journey */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200 pb-3">
          The Customer Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-stone-900 text-base mb-2">Select Service or Ask AI</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Browse our catalog or describe your problem in natural language. Our AI will triage the urgency and suggest the exact service package.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-stone-900 text-base mb-2">Schedule Time & Location</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pick your preferred date and 2-hour arrival slot. Select your saved address in Bengaluru with verified coverage check.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-stone-900 text-base mb-2">Track Technician Arrival</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Watch real-time status updates: "Pro Assigned" → "On The Way" → "Work In Progress". Direct phone coordination available.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="font-bold text-stone-900 text-base mb-2">Inspect & Pay Securely</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Review completed work, receive your digital tax invoice, and pay via UPI, Card, or Demo Mode. Leave your verified review.
            </p>
          </Card>
        </div>
      </div>

      {/* Provider Journey */}
      <div className="space-y-8 bg-surface-100 p-8 rounded-3xl border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200 pb-3">
          For Service Professionals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-base mb-2">1. Onboarding & Verification</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Submit your trade skills, service areas, and Govt ID (Aadhaar/PAN). Our admin team conducts background vetting within 24 hours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-base mb-2">2. Accept Matching Jobs</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Receive booking requests in your service radius. You have full freedom to accept or decline based on your schedule.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-base mb-2">3. Direct Payouts (85% Keep)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Keep 85% of every job. Weekly direct settlements to your bank account with complete transparency and zero hidden deduction fees.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link to="/become-a-pro">
            <Button size="lg">Join FixNear as a Partner</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
