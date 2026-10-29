export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC?: number;
  apparentTemperatureC?: number;
  relativeHumidityPercent?: number;
  weatherCode?: number;
  observedAt?: string;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
}

export interface ForecastDay {
  date: string;
  weatherCode?: number;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  precipitationProbabilityMaxPercent?: number;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current?: CurrentWeather;
  forecast: ForecastDay[];
}

export type WeatherErrorKind = 'network' | 'api' | 'timeout' | 'invalid-response';

export interface WeatherError {
  kind: WeatherErrorKind;
  retryable: boolean;
}
