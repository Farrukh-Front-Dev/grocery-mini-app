import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="text-xs font-medium block" style={{ color: "var(--tg-hint)" }}>{label}</label>}
      <input
        id={id}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-sm border-none outline-none placeholder:text-sm",
          "focus:ring-2 focus:ring-offset-0 transition-shadow",
          className
        )}
        style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-text)" }}
        {...props}
      />
    </div>
  );
}
