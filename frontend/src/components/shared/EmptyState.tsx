import { PackageOpen, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon = PackageOpen, title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={40} strokeWidth={1.5} className="mb-3" style={{ color: "var(--tg-hint)" }} />}
      <p className="font-medium mb-1">{title}</p>
      {description && <p className="text-sm" style={{ color: "var(--tg-hint)" }}>{description}</p>}
    </div>
  );
}
