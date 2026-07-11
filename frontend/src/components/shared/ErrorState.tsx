interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state">
      <span className="text-4xl mb-3">⚠️</span>
      <p className="font-medium mb-1">Xatolik yuz berdi</p>
      <p className="text-sm mb-4" style={{ color: "var(--tg-hint)" }}>{message}</p>
      {onRetry && (
        <button className="btn btn-outline max-w-[200px]" onClick={onRetry}>
          Qayta urinish
        </button>
      )}
    </div>
  );
}
