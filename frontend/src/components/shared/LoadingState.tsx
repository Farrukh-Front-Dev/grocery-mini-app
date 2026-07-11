import { Spinner } from "../ui/spinner";

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <Spinner />
      {text && <p className="text-sm" style={{ color: "var(--tg-hint)" }}>{text}</p>}
    </div>
  );
}
