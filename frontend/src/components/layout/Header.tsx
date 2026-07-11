interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 shrink-0 border-b" style={{ borderColor: "color-mix(in srgb, var(--tg-hint) 20%, transparent)" }}>
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
