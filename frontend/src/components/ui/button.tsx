import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95",
  {
    variants: {
      variant: {
        primary: "text-[var(--tg-button-text)]",
        outline: "bg-transparent border border-solid",
        ghost: "bg-transparent",
        destructive: "text-white",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5",
        lg: "px-6 py-3 text-base",
        icon: "w-9 h-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, children, disabled, ...props }: ButtonProps) {
  const bgStyle = variant === "primary"
    ? { background: "var(--tg-button)" }
    : variant === "destructive"
      ? { background: "var(--tg-destructive)" }
      : variant === "outline"
        ? { borderColor: "color-mix(in srgb, var(--tg-hint) 40%, transparent)", color: "var(--tg-text)" }
        : { color: "var(--tg-button)" };

  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      style={bgStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 rounded-full animate-spin border-current border-t-transparent" />}
      {children}
    </button>
  );
}
