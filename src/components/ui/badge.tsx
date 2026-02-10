import * as React from 'react';
import { cn, statusBadgeVariants, platformBadgeVariants } from '@/lib/styles';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface PlatformBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  platform: 'linkedin' | 'x' | 'substack' | 'instagram';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    const variantClass = statusBadgeVariants[status];

    return (
      <span
        className={cn(variantClass, 'inline-flex items-center font-medium', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export const PlatformBadge = React.forwardRef<HTMLSpanElement, PlatformBadgeProps>(
  ({ className, platform, ...props }, ref) => {
    const variantClass = platformBadgeVariants[platform];

    return (
      <span
        className={cn(variantClass, 'inline-flex items-center font-medium', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

PlatformBadge.displayName = 'PlatformBadge';
