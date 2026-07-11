import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state">
      <AlertTriangle size={40} strokeWidth={1.5} className="mb-3" style={{ color: "var(--tg-destructive)" }} />
      <p className="font-medium mb-1">Xatolik yuz berdi</p>
      <p className="text-sm mb-4" style={{ color: "var(--tg-hint)" }}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Qayta urinish
        </Button>
      )}
    </div>
  );
}
