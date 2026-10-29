import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../../../src/components/states/EmptyState';
import ErrorState from '../../../../src/components/states/ErrorState';
import LoadingState from '../../../../src/components/states/LoadingState';

describe('Weather state components', () => {
  it('announces loading through a busy status region', () => {
    render(<LoadingState message="Buscando Recife…" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Buscando Recife…');
  });

  it('announces an error and invokes the retry callback', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="A consulta demorou demais." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('A consulta demorou demais.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('announces the empty title and hint', () => {
    render(<EmptyState title="Nenhuma cidade" hint="Confira o nome e tente novamente." />);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade');
    expect(screen.getByText('Confira o nome e tente novamente.')).toBeInTheDocument();
  });
});
