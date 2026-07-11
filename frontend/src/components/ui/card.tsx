import { cn } from "../../lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ className, children, onClick, style }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl p-4", className)}
      style={{ background: "var(--tg-secondary-bg)", ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
