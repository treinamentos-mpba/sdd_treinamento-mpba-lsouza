import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface SearchOperation {
  kind: 'search';
  name: string;
}

interface SelectOperation {
  kind: 'selectCity';
  city: City;
}

type LastOperation = SearchOperation | SelectOperation;

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  selectedCity: City | null;
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => void;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function loadWeather(city: City, activeRequest: number): Promise<void> {
    setStatus('loading');
    setData(null);
    setError(null);

    try {
      const weather = await getWeather(city);
      if (requestId.current !== activeRequest) return;
      setData(weather);
      setStatus('success');
    } catch (caught) {
      if (requestId.current !== activeRequest) return;
      setError(toWeatherServiceError(caught));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    setQuery(normalizedName);
    setData(null);
    setCities([]);
    setSelectedCity(null);
    setError(null);

    if (!normalizedName) {
      requestId.current += 1;
      lastOperation.current = null;
      setStatus('idle');
      return;
    }

    const activeRequest = ++requestId.current;
    lastOperation.current = { kind: 'search', name: normalizedName };
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);
      if (requestId.current !== activeRequest) return;

      setCities(results);
      const firstCity = results[0];
      if (!firstCity) {
        setStatus('empty');
        return;
      }

      setStatus('success');
    } catch (caught) {
      if (requestId.current !== activeRequest) return;
      setError(toWeatherServiceError(caught));
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    const activeRequest = ++requestId.current;
    setQuery(city.name);
    setData(null);
    setSelectedCity(city);
    setError(null);
    lastOperation.current = { kind: 'selectCity', city };
    await loadWeather(city, activeRequest);
  }

  function retry(): void {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.kind === 'search') {
      void search(operation.name);
    } else {
      void selectCity(operation.city);
    }
  }

  return { status, data, cities, selectedCity, error, query, search, selectCity, retry };
}

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) return error;
  return new WeatherServiceError('Falha inesperada ao consultar o clima.', 'network');
}
