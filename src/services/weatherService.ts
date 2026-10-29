import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherErrorKind,
} from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  readonly retryable: boolean;

  constructor(
    message: string,
    readonly kind: WeatherErrorKind,
    retryable = true,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
    this.retryable = retryable;
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new WeatherServiceError('A requisição demorou demais.', 'timeout');
    }
    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

export async function searchCities(name: string): Promise<City[]> {
  const normalizedName = name.trim();
  if (!normalizedName) return [];

  const url =
    `${GEOCODING_URL}?name=${encodeURIComponent(normalizedName)}` +
    '&count=5&language=pt&format=json';
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new WeatherServiceError('Falha ao buscar cidades.', 'api');
  }

  const payload = await readJson(response);
  assertNoApiError(payload);
  if (!isRecord(payload)) throw invalidResponse();
  if (payload.results === undefined || payload.results === null) return [];
  if (!Array.isArray(payload.results)) throw invalidResponse();

  return payload.results.slice(0, 5).map(mapCity);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'precipitation',
      'surface_pressure',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_min',
      'temperature_2m_max',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new WeatherServiceError('Falha ao consultar o clima.', 'api');
  }

  const payload = await readJson(response);
  assertNoApiError(payload);
  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw incompleteResponse();
  }
  validateUnits(payload.current_units, payload.daily_units);

  const timezone = asString(payload.timezone);
  if (!timezone) throw incompleteResponse();

  const current = mapCurrent(payload.current);
  const forecast = mapForecast(payload.daily, payload.current.time);

  return { city, timezone, current, forecast };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw invalidResponse();
  }
}

function assertNoApiError(payload: unknown): void {
  if (!isRecord(payload) || payload.error !== true) return;

  throw new WeatherServiceError(
    'A fonte meteorológica não conseguiu atender à consulta. Tente novamente.',
    'api',
  );
}

function validateUnits(currentUnits: unknown, dailyUnits: unknown): void {
  if (!isRecord(currentUnits) || !isRecord(dailyUnits)) throw invalidResponse();

  const expectedUnits: Array<[Record<string, unknown>, string, string]> = [
    [currentUnits, 'temperature_2m', '°C'],
    [currentUnits, 'apparent_temperature', '°C'],
    [currentUnits, 'relative_humidity_2m', '%'],
    [currentUnits, 'wind_speed_10m', 'km/h'],
    [currentUnits, 'precipitation', 'mm'],
    [currentUnits, 'surface_pressure', 'hPa'],
    [currentUnits, 'weather_code', 'wmo code'],
    [dailyUnits, 'temperature_2m_min', '°C'],
    [dailyUnits, 'temperature_2m_max', '°C'],
    [dailyUnits, 'precipitation_probability_max', '%'],
    [dailyUnits, 'weather_code', 'wmo code'],
  ];

  if (expectedUnits.some(([units, field, expected]) => units[field] !== expected)) {
    throw new WeatherServiceError(
      'A resposta do serviço meteorológico usa unidades incompatíveis.',
      'invalid-response',
      false,
    );
  }
}

function mapCity(value: unknown): City {
  if (!isRecord(value)) throw invalidResponse();

  const name = asString(value.name);
  const latitude = asNumber(value.latitude);
  const longitude = asNumber(value.longitude);
  if (!name || latitude === undefined || longitude === undefined) throw invalidResponse();

  return {
    id: asNumber(value.id),
    name,
    latitude,
    longitude,
    region: asString(value.admin1),
    country: asString(value.country),
    timezone: asString(value.timezone),
  };
}

function mapCurrent(value: Record<string, unknown>): CurrentWeather {
  return {
    temperatureC: asNumber(value.temperature_2m),
    apparentTemperatureC: asNumber(value.apparent_temperature),
    relativeHumidityPercent: asNumber(value.relative_humidity_2m),
    weatherCode: asNumber(value.weather_code),
    observedAt: asString(value.time),
    windSpeedKmh: asNumber(value.wind_speed_10m),
    precipitationMm: asNumber(value.precipitation),
    pressureHpa: asNumber(value.surface_pressure),
  };
}

function mapForecast(daily: Record<string, unknown>, currentTime: unknown): ForecastDay[] {
  const times = Array.isArray(daily.time) ? daily.time.map(asString) : [];
  const firstDailyDate = times.find((value): value is string => value !== undefined);
  const currentDate = asString(currentTime)?.slice(0, 10);
  const startDate = isIsoDate(currentDate) ? currentDate : firstDailyDate;
  if (!startDate || !isIsoDate(startDate)) throw incompleteResponse();

  const rowsByDate = new Map<string, ForecastDay>();
  for (let index = 0; index < times.length; index += 1) {
    const date = times[index];
    if (!date || !isIsoDate(date) || rowsByDate.has(date)) continue;

    rowsByDate.set(date, {
      date,
      weatherCode: numberAt(daily.weather_code, index),
      temperatureMinC: numberAt(daily.temperature_2m_min, index),
      temperatureMaxC: numberAt(daily.temperature_2m_max, index),
      precipitationProbabilityMaxPercent: nullableNumberAt(
        daily.precipitation_probability_max,
        index,
      ),
    });
  }

  return Array.from({ length: 5 }, (_, index) => {
    const date = addDays(startDate, index);
    return rowsByDate.get(date) ?? { date };
  });
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days, 12));
  const resultYear = result.getUTCFullYear();
  const resultMonth = String(result.getUTCMonth() + 1).padStart(2, '0');
  const resultDay = String(result.getUTCDate()).padStart(2, '0');
  return `${resultYear}-${resultMonth}-${resultDay}`;
}

function numberAt(value: unknown, index: number): number | undefined {
  return Array.isArray(value) ? asNumber(value[index]) : undefined;
}

function nullableNumberAt(value: unknown, index: number): number | undefined {
  if (!Array.isArray(value) || index >= value.length) return undefined;
  return value[index] === null ? 0 : asNumber(value[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isIsoDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function incompleteResponse(): WeatherServiceError {
  return new WeatherServiceError(
    'A resposta do serviço meteorológico está incompleta.',
    'invalid-response',
  );
}

function invalidResponse(): WeatherServiceError {
  return new WeatherServiceError('Resposta inválida do serviço meteorológico.', 'invalid-response');
}
