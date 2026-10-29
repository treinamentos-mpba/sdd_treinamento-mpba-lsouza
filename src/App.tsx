import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import LocationResults from './components/LocationResults';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const mainRef = useRef<HTMLElement>(null);
  const { status, data, cities, selectedCity, error, query, search, selectCity, retry } =
    useWeather();

  useEffect(() => {
    if (status === 'success') mainRef.current?.focus();
  }, [status]);

  function retrySearch() {
    mainRef.current?.focus();
    retry();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/65 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <a
            href="#main-content"
            className="sr-only rounded-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-night-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Pular para o conteúdo
          </a>
          <div className="inline-flex w-fit items-center gap-3">
            <span aria-hidden="true" className="text-3xl text-sun">
              ☀
            </span>
            <span className="text-xl font-bold tracking-normal text-white">Clima</span>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar onSearch={(name) => void search(name)} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        aria-busy={status === 'loading'}
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-400 sm:px-6 sm:py-10 lg:px-8"
      >
        {status === 'idle' && (
          <EmptyState
            title="O tempo da sua cidade"
            hint="Os dados atuais e a previsão para os próximos dias aparecerão aqui após a consulta."
          />
        )}
        {status === 'loading' && <LoadingState message={`Buscando ${query}…`} />}
        {status === 'empty' && (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não encontramos resultados para ${query}. Confira o nome e tente novamente.`}
          />
        )}
        {status === 'error' && (
          <ErrorState
            message={error?.message ?? 'Falha ao carregar o clima.'}
            onRetry={retrySearch}
          />
        )}
        {status === 'success' && (
          <>
            <LocationResults
              cities={cities}
              selectedCity={selectedCity}
              onSelect={(city) => void selectCity(city)}
            />
            {data?.current && (
              <>
                <CurrentWeather city={data.city} current={data.current} unit={unit} />
                <ForecastList days={data.forecast} unit={unit} />
              </>
            )}
            {data && !data.current && (
              <EmptyState
                title="Clima indisponível"
                hint="A resposta não trouxe condições atuais para esta cidade."
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
