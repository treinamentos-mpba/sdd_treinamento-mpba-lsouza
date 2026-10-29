import { formatDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const weather = getWeatherPresentation(day.weatherCode);

  return (
    <li className="min-w-0 rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md">
      <article aria-label={`${formatDayLabel(day.date, index)}, ${weather.label}`}>
        <h3 className="font-semibold text-white">{formatDayLabel(day.date, index)}</h3>
        <p className="mt-1 text-xs text-white/75">{getShortDate(day.date)}</p>
        <span role="img" aria-label={weather.label} className="mt-4 block text-3xl leading-none">
          {weather.icon}
        </span>
        <p className="mt-3 text-sm text-white/80">{weather.label}</p>
        <p className="mt-4 text-sm font-semibold text-white">
          Máx. {formatTemperature(day.temperatureMaxC, unit)}
        </p>
        <p className="mt-1 text-sm text-white/75">
          Mín. {formatTemperature(day.temperatureMinC, unit)}
        </p>
        <p className="mt-4 border-t border-white/15 pt-3 text-sm text-accent-400">
          Chuva: {formatMetricProbability(day.precipitationProbabilityMaxPercent)}
        </p>
      </article>
    </li>
  );
}

function formatMetricProbability(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value) ? 'Indisponível' : `${value}%`;
}
