import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  if (days.length === 0) {
    return (
      <section aria-labelledby="forecast-title" className="text-white">
        <h2 id="forecast-title" className="text-lg font-semibold">
          Previsão de 5 dias
        </h2>
        <p className="mt-3 text-sm text-white/75">Previsão indisponível.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="forecast-title" className="text-white">
      <h2 id="forecast-title" className="text-lg font-semibold">
        Previsão de 5 dias
      </h2>
      <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((day, index) => (
          <ForecastCard key={day.date} day={day} index={index} unit={unit} />
        ))}
      </ol>
    </section>
  );
}
