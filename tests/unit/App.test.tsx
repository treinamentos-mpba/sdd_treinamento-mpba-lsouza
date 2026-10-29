import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import * as weatherService from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Recife',
  latitude: -8.05,
  longitude: -34.9,
  region: 'Pernambuco',
  country: 'Brasil',
  timezone: 'America/Recife',
};

const weather: WeatherData = {
  city,
  timezone: 'America/Recife',
  current: { temperatureC: 27, apparentTemperatureC: 29, weatherCode: 2 },
  forecast: [
    { date: '2026-10-29', temperatureMinC: 23, temperatureMaxC: 29 },
    { date: '2026-10-30', temperatureMinC: 23, temperatureMaxC: 28 },
    { date: '2026-10-31', temperatureMinC: 22, temperatureMaxC: 27 },
    { date: '2026-11-01', temperatureMinC: 23, temperatureMaxC: 29 },
    { date: '2026-11-02', temperatureMinC: 24, temperatureMaxC: 30 },
  ],
};

function submitSearch(query: string) {
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
    target: { value: query },
  });
  fireEvent.submit(screen.getByRole('search'));
}

afterEach(() => vi.restoreAllMocks());

describe('App', () => {
  it('starts in the idle state', () => {
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('O tempo da sua cidade');
  });

  it('loads weather after city selection and derives temperature from UI unit state', async () => {
    const searchCitiesMock = vi.spyOn(weatherService, 'searchCities').mockResolvedValue([city]);
    const getWeatherMock = vi.spyOn(weatherService, 'getWeather').mockResolvedValue(weather);
    render(<App />);
    submitSearch('Recife');

    expect(await screen.findByRole('region', { name: 'Cidades encontradas' })).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledWith('Recife');
    expect(getWeatherMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ }));

    expect(await screen.findByRole('heading', { name: 'Recife' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(getWeatherMock).toHaveBeenCalledWith(city);
    expect(screen.getByText('27 °C')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('81 °F')).toBeInTheDocument();
    expect(getWeatherMock).toHaveBeenCalledOnce();
  });

  it('marks the main region busy while a request is pending', async () => {
    let resolveSearch: ((cities: City[]) => void) | undefined;
    vi.spyOn(weatherService, 'searchCities').mockImplementation(
      () =>
        new Promise<City[]>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    vi.spyOn(weatherService, 'getWeather').mockResolvedValue(weather);
    render(<App />);

    submitSearch('Recife');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveSearch?.([city]);
    });
    expect(await screen.findByRole('region', { name: 'Cidades encontradas' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ })).toBeInTheDocument();
    expect(screen.queryByText('27 °C')).not.toBeInTheDocument();
  });

  it('shows empty when geocoding returns no results', async () => {
    const searchCitiesMock = vi.spyOn(weatherService, 'searchCities').mockResolvedValue([]);
    const getWeatherMock = vi.spyOn(weatherService, 'getWeather').mockResolvedValue(weather);
    render(<App />);
    submitSearch('Londres');

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada'),
    );
    expect(searchCitiesMock).toHaveBeenCalledWith('Londres');
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('shows service errors and retries the last search with focus returned to main', async () => {
    const searchCitiesMock = vi
      .spyOn(weatherService, 'searchCities')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce([city]);
    const getWeatherMock = vi.spyOn(weatherService, 'getWeather').mockResolvedValue(weather);
    render(<App />);
    submitSearch('Recife');

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(screen.getByRole('main')).toHaveFocus();
    expect(await screen.findByRole('region', { name: 'Cidades encontradas' })).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(getWeatherMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Recife.*Pernambuco.*Brasil/ }));
    expect(await screen.findByRole('heading', { name: 'Recife' })).toBeInTheDocument();
  });
});
