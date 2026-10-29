interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Carregando condições do tempo…',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-48 flex-col items-center justify-center gap-4 text-center text-white"
    >
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-accent-400"
      />
      <p>{message}</p>
    </div>
  );
}
