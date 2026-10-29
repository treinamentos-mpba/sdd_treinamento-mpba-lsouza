import { formatTime, isObservationStale } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherMetrics extends CurrentWeatherData {
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
}

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherMetrics;
  unit: Unit;
}

function formatMetric(value: number | undefined, unit: string): string {
  if (value === undefined || !Number.isFinite(value)) return 'Indisponível';
  return unit === '%' ? `${value}%` : `${value} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weather = getWeatherPresentation(current.weatherCode);
  const temperature = formatTemperature(current.temperatureC, unit);
  const observationIsStale = isObservationStale(current.observedAt, city.timezone);
  const locationDetails = [city.region, city.country].filter(Boolean).join(', ');
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-lg border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-accent-400">Agora em</p>
          <h1 id="current-weather-title" className="mt-1 text-2xl font-semibold text-white">
            {city.name}
          </h1>
          {locationDetails && <p className="mt-1 text-sm text-white/75">{locationDetails}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
            <p>Referência temporal: {formatTime(current.observedAt, city.timezone)}</p>
            {observationIsStale === true && (
              <p role="status" className="font-medium text-sun">
                Dados desatualizados
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span role="img" aria-label={weather.label} className="text-5xl leading-none">
            {weather.icon}
          </span>
          <div>
            <div role="group" aria-label={`Temperatura: ${temperature}`}>
              <p className="text-5xl font-bold leading-none tracking-normal text-white sm:text-6xl">
                {temperature}
              </p>
            </div>
            <p className="mt-2 text-base text-white/75">{weather.label}</p>
            <p className="mt-1 text-sm text-white/75">
              Sensação: {formatTemperature(current.apparentTemperatureC, unit)}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-5 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-sm text-white/75">{metric.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
