import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCity = city.trim();
    if (!trimmedCity || disabled) return;

    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full gap-2 rounded-lg border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md"
    >
      <label htmlFor="city-search" className="sr-only">
        Buscar cidade
      </label>
      <input
        id="city-search"
        type="search"
        name="city"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Digite uma cidade"
        autoComplete="off"
        disabled={disabled}
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-3 py-2 text-white placeholder:text-white/75 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || city.trim().length === 0}
        className="shrink-0 rounded-md bg-accent-400 px-4 py-2 font-semibold text-night-900 transition-colors hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Buscar
      </button>
    </form>
  );
}
