import React from 'react';

export const Legal: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Effective Date: October 2026 • Governing Jurisdiction: Bengaluru, Karnataka, India
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
        {isPrivacy ? (
          <>
            <h3 className="text-base font-bold text-stone-900">1. Information We Collect</h3>
            <p>
              FixNear ("we", "our", or "us") respects your privacy and is committed to protecting personal data in accordance with India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000. We collect your name, phone number, address, and optional problem diagnostic photos when you book home services.
            </p>

            <h3 className="text-base font-bold text-stone-900">2. Purpose of Processing</h3>
            <p>
              Your contact details and service address are strictly disclosed to the assigned verified professional only during the active booking lifecycle to enable timely arrival and work execution. We do not sell your personal data to third-party telemarketers.
            </p>

            <h3 className="text-base font-bold text-stone-900">3. Payment Information Security</h3>
            <p>
              All online transactions are securely encrypted and processed by Razorpay in compliance with RBI guidelines. FixNear never stores raw debit/credit card numbers or UPI MPINs on our application servers.
            </p>

            <h3 className="text-base font-bold text-stone-900">4. Account Deletion & Data Rights</h3>
            <p>
              Customers may request a complete export or permanent deletion of their account records by contacting privacy@fixnear.in.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-bold text-stone-900">1. Marketplace Platform Relationship</h3>
            <p>
              FixNear operates as a digital technology marketplace connecting consumers with independent skilled tradespeople. While FixNear conducts ID verification and skills vetting, service professionals act as independent contractors.
            </p>

            <h3 className="text-base font-bold text-stone-900">2. Pricing & Payments</h3>
            <p>
              All listed rates are denominated in Indian Rupees (INR ₹). A standard convenience fee of ₹49 is levied per booking to maintain customer support, safety insurance, and live dispatch tracking. Any replacement hardware or spare parts must be approved in writing by the customer prior to installation.
            </p>

            <h3 className="text-base font-bold text-stone-900">3. Cancellation & Rescheduling</h3>
            <p>
              Bookings may be cancelled or rescheduled free of charge before the assigned professional initiates travel. If cancelled after the provider is marked "On The Way", a ₹49 dispatch compensation fee applies.
            </p>

            <h3 className="text-base font-bold text-stone-900">4. Dispute Resolution</h3>
            <p>
              Any disputes or grievances are subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
