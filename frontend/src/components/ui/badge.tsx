import { cn } from "../../lib/utils";

interface BadgeProps {
  variant?: "blue" | "yellow" | "green" | "red" | "gray";
  children: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  blue: { background: "color-mix(in srgb, var(--tg-button) 20%, transparent)", color: "var(--tg-button)" },
  yellow: { background: "#fef3c7", color: "#92400e" },
  green: { background: "#d1fae5", color: "#065f46" },
  red: { background: "#fee2e2", color: "#991b1b" },
  gray: { background: "color-mix(in srgb, var(--tg-hint) 15%, transparent)", color: "var(--tg-hint)" },
};

export function Badge({ variant = "gray", children }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium")} style={variantStyles[variant]}>
      {children}
    </span>
  );
}
