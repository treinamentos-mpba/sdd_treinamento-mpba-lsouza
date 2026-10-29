import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const city: City = {
  name: 'Recife',
  latitude: -8.05,
  longitude: -34.9,
  timezone: 'America/Recife',
};

const currentUnits = {
  temperature_2m: '°C',
  apparent_temperature: '°C',
  relative_humidity_2m: '%',
  wind_speed_10m: 'km/h',
  precipitation: 'mm',
  surface_pressure: 'hPa',
  weather_code: 'wmo code',
};

const dailyUnits = {
  temperature_2m_min: '°C',
  temperature_2m_max: '°C',
  precipitation_probability_max: '%',
  weather_code: 'wmo code',
};

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('searchCities', () => {
  it('returns an empty list without calling fetch for blank input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the name and maps at most five results in order', async () => {
    const results = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      name: index === 0 ? 'São Tomé' : `Cidade ${index + 1}`,
      latitude: index,
      longitude: -index,
      admin1: 'Região',
      country: 'País',
      timezone: 'America/Sao_Paulo',
    }));
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results }));
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities(' São Tomé ');
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(requestUrl.searchParams.get('name')).toBe('São Tomé');
    expect(requestUrl.searchParams.get('count')).toBe('5');
    expect(cities).toHaveLength(5);
    expect(cities[0]).toMatchObject({ id: 1, name: 'São Tomé', region: 'Região', country: 'País' });
  });

  it.each([
    'São Tomé',
    'Port-au-Prince',
    "O'Fallon",
  ])('preserves special characters in the encoded query: %s', async (name) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await searchCities(name);

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.searchParams.get('name')).toBe(name);
  });

  it('throws WeatherServiceError for a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
    });
  });

  it('returns an empty list when results is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({} as unknown)));

    await expect(searchCities('Recife')).resolves.toEqual([]);
  });

  it('rejects malformed JSON instead of treating it as an empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{', { status: 200 })));

    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('maps an API error payload to a friendly message instead of empty results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: true, reason: 'Invalid query' })),
    );

    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
      message: 'A fonte meteorológica não conseguiu atender à consulta. Tente novamente.',
    });
  });
});

describe('fetchWithTimeout', () => {
  it('converts AbortError to the timeout error and clears its timer', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );

    const request = fetchWithTimeout('https://example.test');
    const assertion = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição demorou demais.',
      kind: 'timeout',
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;

    expect(vi.getTimerCount()).toBe(0);
  });

  it('converts network failures to the requested message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));

    await expect(fetchWithTimeout('https://example.test')).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
    await expect(fetchWithTimeout('https://example.test')).rejects.toMatchObject({
      message: 'Falha de rede.',
      kind: 'network',
    });
  });

  it('clears the timeout after a successful response', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok')));

    await expect(fetchWithTimeout('https://example.test')).resolves.toBeInstanceOf(Response);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  it('requests current and daily and maps five local days and current metrics', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        timezone: 'America/Recife',
        current_units: currentUnits,
        daily_units: dailyUnits,
        current: {
          time: '2026-10-29T12:00',
          temperature_2m: 27,
          apparent_temperature: 29,
          relative_humidity_2m: 74,
          weather_code: 2,
          wind_speed_10m: 14,
          precipitation: 0.2,
          surface_pressure: 1012,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          weather_code: [2, 3, 61, 1, 0],
          temperature_2m_min: [23, 23, 22, 23, 24],
          temperature_2m_max: [29, 28, 27, 29, 30],
          precipitation_probability_max: [20, 35, null, 10, 5],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(requestUrl.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(requestUrl.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('current')).toContain('temperature_2m');
    expect(requestUrl.searchParams.get('daily')).toContain('temperature_2m_min');
    expect(result.current).toMatchObject({
      temperatureC: 27,
      apparentTemperatureC: 29,
      relativeHumidityPercent: 74,
      weatherCode: 2,
      windSpeedKmh: 14,
      precipitationMm: 0.2,
      pressureHpa: 1012,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[2]).toMatchObject({
      date: '2026-10-31',
      temperatureMinC: 22,
      temperatureMaxC: 27,
      precipitationProbabilityMaxPercent: 0,
    });
  });

  it('rejects a response without current', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'UTC',
          daily: { time: ['2026-10-29'] },
        }),
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('rejects a response without daily', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ timezone: 'UTC', current: { time: '2026-10-29T12:00' } }),
        ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('throws WeatherServiceError for a non-OK forecast response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
      message: 'Falha ao consultar o clima.',
    });
  });

  it('rejects a response that declares incompatible units', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Recife',
          current_units: { ...currentUnits, temperature_2m: '°F' },
          daily_units: dailyUnits,
          current: { time: '2026-10-29T12:00' },
          daily: { time: ['2026-10-29'] },
        }),
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
      retryable: false,
    });
  });

  it('pads a short daily response to five date entries without shifting values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Recife',
          current_units: currentUnits,
          daily_units: dailyUnits,
          current: { time: '2026-10-29T12:00' },
          daily: {
            time: ['2026-10-29', '2026-10-30'],
            temperature_2m_max: [29, 28],
          },
        }),
      ),
    );

    const result = await getWeather(city);
    expect(result.current?.temperatureC).toBeUndefined();
    expect(result.current?.relativeHumidityPercent).toBeUndefined();
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[1]).toMatchObject({ date: '2026-10-30', temperatureMaxC: 28 });
    expect(result.forecast[2]).toEqual({ date: '2026-10-31' });
  });

  it('keeps nullable current metrics unavailable instead of producing NaN', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Recife',
          current_units: currentUnits,
          daily_units: dailyUnits,
          current: {
            time: '2026-10-29T12:00',
            temperature_2m: null,
            apparent_temperature: null,
            relative_humidity_2m: null,
            weather_code: null,
          },
          daily: { time: ['2026-10-29'] },
        }),
      ),
    );

    const result = await getWeather(city);
    expect(result.current).toMatchObject({ observedAt: '2026-10-29T12:00' });
    expect(result.current?.temperatureC).toBeUndefined();
    expect(result.current?.apparentTemperatureC).toBeUndefined();
    expect(result.current?.relativeHumidityPercent).toBeUndefined();
    expect(result.current?.weatherCode).toBeUndefined();
    expect(result.forecast).toHaveLength(5);
  });
});
