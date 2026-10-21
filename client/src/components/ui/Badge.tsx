import React from 'react';
import { clsx } from 'clsx';
import { BookingStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const styles = {
    default: 'bg-stone-100 text-stone-800 border-stone-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Awaiting Confirmation</Badge>;
    case 'confirmed':
      return <Badge variant="info">Confirmed</Badge>;
    case 'provider_assigned':
      return <Badge variant="info">Pro Assigned</Badge>;
    case 'provider_en_route':
      return <Badge variant="purple">Pro On The Way</Badge>;
    case 'in_progress':
      return <Badge variant="warning">Work In Progress</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'cancellation_requested':
      return <Badge variant="danger">Cancel Requested</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Cancelled</Badge>;
    case 'disputed':
      return <Badge variant="danger">Under Review</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
