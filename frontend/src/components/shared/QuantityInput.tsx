interface QuantityInputProps {
  value: number;
  step: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}

export function QuantityInput({ value, step, min = 0, max = Infinity, disabled, onChange }: QuantityInputProps) {
  const dec = () => {
    const next = parseFloat((value - step).toFixed(3));
    if (next >= min) onChange(next);
  };

  const inc = () => {
    const next = parseFloat((value + step).toFixed(3));
    if (next <= max) onChange(next);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium border-none cursor-pointer disabled:opacity-30"
        style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-text)" }}
        onClick={dec}
        disabled={disabled || value <= min}
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-medium">{value}</span>
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium border-none cursor-pointer disabled:opacity-30"
        style={{ background: "var(--tg-secondary-bg)", color: "var(--tg-text)" }}
        onClick={inc}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  );
}
