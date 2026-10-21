import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-stone-200/90 shadow-card transition-all',
        hoverEffect && 'hover:shadow-md hover:border-brand-300 hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
