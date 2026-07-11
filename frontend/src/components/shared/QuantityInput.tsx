import { Minus, Plus } from "lucide-react";

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
        className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-30"
        style={{ background: "color-mix(in srgb, var(--tg-hint) 15%, transparent)", color: "var(--tg-text)" }}
        onClick={dec}
        disabled={disabled || value <= min}
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-30"
        style={{ background: "color-mix(in srgb, var(--tg-hint) 15%, transparent)", color: "var(--tg-text)" }}
        onClick={inc}
        disabled={disabled || value >= max}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
