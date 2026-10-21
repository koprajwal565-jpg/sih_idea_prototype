import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { apiRequest } from '../../lib/api';

interface AIBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIBookingModal: React.FC<AIBookingModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/assist-booking', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      if (res.success) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectService = (slug: string) => {
    onClose();
    navigate(`/services/${slug}?ai_issue=${encodeURIComponent(query)}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="FixNear AI Problem Assistant" maxWidth="xl">
      <div className="space-y-4">
        <p className="text-sm text-stone-600">
          Describe what is broken or what maintenance you need in plain English. Our AI will identify the right technician, diagnose urgency, and prepare your booking.
        </p>

        {/* Query Input */}
        <form onSubmit={handleDiagnose} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-stone-400"
            placeholder="e.g. My master bedroom split AC is blowing warm air and making a whistling noise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" isLoading={isLoading} disabled={!query.trim()}>
            <Sparkles className="w-4 h-4 mr-1 text-emerald-200" />
            Analyze
          </Button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-stone-500">Try asking:</span>
          {[
            'Kitchen sink is clogged and overflowing',
            'AC running but cooling very weak',
            'Ceiling fan wobbling violently',
            'Need deep cleaning for 2 bathrooms',
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
              }}
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Diagnosis Result */}
        {result && (
          <div className="mt-4 p-4 bg-brand-50/60 rounded-xl border border-brand-200/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-brand-200/60 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                Recommended Service
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  result.urgency_level === 'urgent'
                    ? 'bg-rose-100 text-rose-800'
                    : result.urgency_level === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Urgency: {result.urgency_level.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-stone-900 text-base">
                  {result.suggested_service.name}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Category: {result.detected_category.name} • Approx Duration: {result.suggested_service.duration_minutes} mins
                </p>
                <p className="text-xs text-stone-700 mt-2 bg-white/70 p-2 rounded-lg border border-brand-100">
                  {result.structured_summary}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs text-stone-500">Standard Price</span>
                <p className="text-lg font-bold text-brand-700">₹{result.suggested_service.base_price_inr}</p>
              </div>
            </div>

            {/* Clarification Tips */}
            {result.clarifying_questions && result.clarifying_questions.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-medium text-stone-700 flex items-center gap-1 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                  Key details the pro will check:
                </span>
                <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside bg-white/50 p-2 rounded-md">
                  {result.clarifying_questions.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button onClick={() => handleSelectService(result.suggested_service.slug)}>
                Book This Service Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
