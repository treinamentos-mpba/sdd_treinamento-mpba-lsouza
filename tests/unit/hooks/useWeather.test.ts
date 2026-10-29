import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import * as weatherService from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

const recife: City = {
  id: 1,
  name: 'Recife',
  latitude: -8.05,
  longitude: -34.9,
  country: 'Brasil',
  timezone: 'America/Recife',
};
const salvador: City = {
  id: 2,
  name: 'Salvador',
  latitude: -12.98,
  longitude: -38.5,
  country: 'Brasil',
  timezone: 'America/Bahia',
};
const weather: WeatherData = {
  city: recife,
  timezone: 'America/Recife',
  current: { temperatureC: 27 },
  forecast: [],
};

afterEach(() => vi.restoreAllMocks());

describe('useWeather', () => {
  it('starts idle and does not request cities for a blank query', async () => {
    const searchCitiesMock = vi.spyOn(weatherService, 'searchCities');
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    await act(async () => result.current.search('   '));

    expect(result.current.status).toBe('idle');
    expect(result.current.query).toBe('');
    expect(searchCitiesMock).not.toHaveBeenCalled();
  });

  it('returns search results without loading weather before explicit selection', async () => {
    const searchCitiesMock = vi
      .spyOn(weatherService, 'searchCities')
      .mockResolvedValue([recife, salvador]);
    const getWeatherMock = vi.spyOn(weatherService, 'getWeather');
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search(' Recife '));

    expect(searchCitiesMock).toHaveBeenCalledWith('Recife');
    expect(getWeatherMock).not.toHaveBeenCalled();
    expect(result.current.cities).toEqual([recife, salvador]);
    expect(result.current.status).toBe('success');

    getWeatherMock.mockResolvedValueOnce({ ...weather, city: salvador });
    await act(async () => result.current.selectCity(salvador));
    expect(getWeatherMock).toHaveBeenCalledWith(salvador);
    expect(result.current.data?.city).toEqual(salvador);
    expect(result.current.selectedCity).toEqual(salvador);
    expect(result.current.status).toBe('success');
  });

  it('sets empty when geocoding returns no cities', async () => {
    vi.spyOn(weatherService, 'searchCities').mockResolvedValue([]);
    const getWeatherMock = vi.spyOn(weatherService, 'getWeather');
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Atlantis'));

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('selects a city directly and retries the last weather request', async () => {
    const getWeatherMock = vi
      .spyOn(weatherService, 'getWeather')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce({ ...weather, city: salvador });
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(salvador));
    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Falha de rede.');

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(getWeatherMock).toHaveBeenLastCalledWith(salvador);
    expect(result.current.data?.city).toEqual(salvador);
  });

  it('retries after a simulated offline error', async () => {
    const getWeatherMock = vi
      .spyOn(weatherService, 'getWeather')
      .mockRejectedValueOnce(new weatherService.WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(recife));
    expect(result.current.status).toBe('error');
    expect(result.current.error?.kind).toBe('network');

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(getWeatherMock).toHaveBeenCalledTimes(2);
  });

  it('ignores a stale geocoding response that resolves after a newer search', async () => {
    let resolveFirstSearch: ((cities: City[]) => void) | undefined;
    const searchCitiesMock = vi
      .spyOn(weatherService, 'searchCities')
      .mockImplementationOnce(
        () =>
          new Promise<City[]>((resolve) => {
            resolveFirstSearch = resolve;
          }),
      )
      .mockResolvedValueOnce([salvador]);
    const getWeatherMock = vi
      .spyOn(weatherService, 'getWeather')
      .mockResolvedValue({ ...weather, city: salvador });
    const { result } = renderHook(() => useWeather());

    let firstRequest: Promise<void> | undefined;
    await act(async () => {
      firstRequest = result.current.search('Recife');
      await result.current.search('Salvador');
    });
    await act(async () => {
      resolveFirstSearch?.([recife]);
      await firstRequest;
    });

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(getWeatherMock).not.toHaveBeenCalled();
    expect(result.current.query).toBe('Salvador');
    expect(result.current.cities).toEqual([salvador]);
    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('success');
  });
});
