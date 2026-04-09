import React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-gray-900 text-gray-50 hover:bg-gray-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'text-gray-900 border border-gray-200',
};

const Badge = ({ className, variant = 'default', ...props }) => (
  <div
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
      badgeVariants[variant],
      className
    )}
    {...props}
  />
);

Badge.displayName = 'Badge';

export { Badge };