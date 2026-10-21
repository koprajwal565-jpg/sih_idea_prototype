import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Clock, CreditCard, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/50 border border-brand-700/50 flex items-center justify-center text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">Verified Technicians</h5>
              <p className="text-xs text-stone-400">Govt ID & police checked</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/50 border border-brand-700/50 flex items-center justify-center text-brand-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">On-Time Arrival</h5>
              <p className="text-xs text-stone-400">Live technician dispatch tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/50 border border-brand-700/50 flex items-center justify-center text-brand-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">Transparent Pricing</h5>
              <p className="text-xs text-stone-400">Standard rates, no hidden fees</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/50 border border-brand-700/50 flex items-center justify-center text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-sm">AI Booking Assistance</h5>
              <p className="text-xs text-stone-400">Smart diagnostics for instant triage</p>
            </div>
          </div>
        </div>

        {/* Directory Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-stone-800 text-sm">
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Fix<span className="text-brand-500">Near</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm mb-4">
              FixNear is an AI-powered home services marketplace connecting Bengaluru homeowners and tenants with verified independent tradespeople for plumbing, electrical, carpentry, AC repair, and deep cleaning.
            </p>
            <p className="text-xs text-stone-500">
              Target Market: India (INR ₹) • Timezone: Asia/Kolkata
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/services?category_slug=electrician" className="hover:text-white">Electrician</Link></li>
              <li><Link to="/services?category_slug=plumbing" className="hover:text-white">Plumbing Repairs</Link></li>
              <li><Link to="/services?category_slug=ac-appliances" className="hover:text-white">AC & Appliances</Link></li>
              <li><Link to="/services?category_slug=carpentry" className="hover:text-white">Carpentry</Link></li>
              <li><Link to="/services?category_slug=cleaning" className="hover:text-white">Deep House Cleaning</Link></li>
              <li><Link to="/services?category_slug=ro-water-purifier" className="hover:text-white">RO Purifiers</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Professionals</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/become-a-pro" className="hover:text-white">Join as a Partner</Link></li>
              <li><Link to="/become-a-pro#earnings" className="hover:text-white">Earnings & Commission</Link></li>
              <li><Link to="/become-a-pro#verification" className="hover:text-white">Verification Rules</Link></li>
              <li><Link to="/provider/dashboard" className="hover:text-white">Partner Portal</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Support & Legal</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link to="/help" className="hover:text-white">Help & Support</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} FixNear Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Indian Homes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
