interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "📭", title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-medium mb-1">{title}</p>
      {description && <p style={{ color: "var(--tg-hint)" }}>{description}</p>}
    </div>
  );
}
