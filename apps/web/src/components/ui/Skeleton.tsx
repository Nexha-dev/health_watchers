import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Convenience shorthand for rounded-full (e.g. avatar skeletons) */
  circle?: boolean;
}

export function Skeleton({ circle, className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse bg-neutral-200',
        circle ? 'rounded-full' : 'rounded-md',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}
