import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../src/components/SearchBar';

describe('SearchBar', () => {
  it('exposes an accessible search form and submits a trimmed city', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '  Recife  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
  });

  it('does not submit an empty or whitespace-only value', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const form = screen.getByRole('search');
    fireEvent.submit(form);

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('disables the input and submit button when disabled', () => {
    render(<SearchBar onSearch={vi.fn()} disabled />);

    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });
});
