import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={['flex flex-col items-center justify-center gap-3 py-16 text-center', className ?? ''].join(' ')}
    >
      {icon && (
        <span className="text-neutral-300" aria-hidden="true">{icon}</span>
      )}
      <p className="text-base font-semibold text-neutral-700">{title}</p>
      {description && <p className="text-sm text-neutral-500 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
