import { cn } from "../../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up",
          className
        )}
        style={{ background: "var(--tg-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
