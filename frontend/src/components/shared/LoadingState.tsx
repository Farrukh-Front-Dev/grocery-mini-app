export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--tg-button)", borderTopColor: "transparent" }} />
    </div>
  );
}
