interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex min-h-48 flex-col items-center justify-center px-4 text-center text-white"
    >
      <span aria-hidden="true" className="text-4xl text-accent-400">
        ◌
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/75">{hint}</p>
    </section>
  );
}
