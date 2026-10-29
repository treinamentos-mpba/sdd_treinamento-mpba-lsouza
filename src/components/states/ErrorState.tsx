interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="error-state-title"
      className="rounded-lg border border-rose-200/35 bg-rose-300/10 p-6 text-center text-white shadow-glass backdrop-blur-md"
    >
      <h2 id="error-state-title" className="text-lg font-semibold">
        Não foi possível carregar o clima
      </h2>
      <p role="alert" className="mt-2 text-white/80">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-md border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        Tentar novamente
      </button>
    </section>
  );
}
