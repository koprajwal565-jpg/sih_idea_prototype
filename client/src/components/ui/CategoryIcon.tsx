import React from 'react';
import {
  Zap,
  Droplets,
  Wind,
  Hammer,
  Sparkles,
  Paintbrush,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name.toLowerCase()) {
    case 'zap':
    case 'electrician':
      return <Zap {...props} />;
    case 'droplet':
    case 'droplets':
    case 'plumbing':
      return <Droplets {...props} />;
    case 'wind':
    case 'ac':
    case 'ac-appliances':
      return <Wind {...props} />;
    case 'hammer':
    case 'carpentry':
      return <Hammer {...props} />;
    case 'sparkles':
    case 'cleaning':
      return <Sparkles {...props} />;
    case 'paintbrush':
    case 'painting':
      return <Paintbrush {...props} />;
    case 'shieldalert':
    case 'pest-control':
      return <ShieldAlert {...props} />;
    case 'shieldcheck':
    case 'ro':
    case 'ro-water-purifier':
      return <ShieldCheck {...props} />;
    default:
      return <Wrench {...props} />;
  }
};
