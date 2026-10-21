import React from 'react';
import { Check, Clock, Truck, PlayCircle, CheckCircle2 } from 'lucide-react';
import { BookingStatus } from '../../types';

interface StatusStepperProps {
  status: BookingStatus;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ status }) => {
  const steps = [
    { key: 'confirmed', label: 'Confirmed', icon: Clock },
    { key: 'provider_assigned', label: 'Pro Assigned', icon: Check },
    { key: 'provider_en_route', label: 'On The Way', icon: Truck },
    { key: 'in_progress', label: 'In Progress', icon: PlayCircle },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const getStepIndex = (s: BookingStatus) => {
    switch (s) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'provider_assigned':
        return 2;
      case 'provider_en_route':
        return 3;
      case 'in_progress':
        return 4;
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(status);
  const isCancelled = status === 'cancelled' || status === 'cancellation_requested';

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-sm font-medium flex items-center gap-2">
        <span>⚠️ This booking was cancelled.</span>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting bar */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, ((currentIndex - 1) / (steps.length - 1)) * 100))}%`,
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentIndex > idx + 1;
          const isCurrent = currentIndex === idx + 1;

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all ${
                  isDone
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : isCurrent
                    ? 'bg-white border-brand-600 text-brand-600 ring-4 ring-brand-100'
                    : 'bg-white border-stone-300 text-stone-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  isCurrent ? 'text-brand-700 font-semibold' : isDone ? 'text-stone-800' : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
