import { cn } from "../../lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, id, options, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="text-xs font-medium block" style={{ color: "var(--tg-hint)" }}>{label}</label>}
      <select
        id={id}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-sm border-none outline-none appearance-none cursor-pointer",
          className
        )}
        style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-text)" }}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
