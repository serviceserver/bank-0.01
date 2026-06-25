// components/ui/EmptyState.tsx

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

import { FiInbox } from "react-icons/fi";

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-4 text-muted">
        <FiInbox />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}