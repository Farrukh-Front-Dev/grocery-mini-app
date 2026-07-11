import { cn } from "../../lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn("border-2 rounded-full animate-spin", sizeMap[size])}
        style={{ borderColor: "var(--tg-button)", borderTopColor: "transparent" }}
      />
    </div>
  );
}
