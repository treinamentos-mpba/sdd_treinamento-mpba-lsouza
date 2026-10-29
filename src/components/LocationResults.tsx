import type { City } from '../types/weather';

interface LocationResultsProps {
  cities: City[];
  selectedCity?: City | null;
  onSelect: (city: City) => void;
}

function cityKey(city: City): string {
  return city.id === undefined
    ? `${city.latitude},${city.longitude},${city.name}`
    : String(city.id);
}

function cityDetails(city: City): string {
  return [city.region, city.country].filter(Boolean).join(', ');
}

export default function LocationResults({ cities, selectedCity, onSelect }: LocationResultsProps) {
  if (cities.length === 0) return null;

  return (
    <section aria-labelledby="location-results-title" className="text-white">
      <h2 id="location-results-title" className="text-lg font-semibold">
        Cidades encontradas
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const details = cityDetails(city);
          const selected = selectedCity ? cityKey(city) === cityKey(selectedCity) : false;

          return (
            <li key={cityKey(city)}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(city)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left text-white shadow-glass backdrop-blur-md transition-colors hover:border-accent-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
              >
                <span className="block font-semibold">{city.name}</span>
                {details && <span className="mt-1 block text-sm text-white/75">{details}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
