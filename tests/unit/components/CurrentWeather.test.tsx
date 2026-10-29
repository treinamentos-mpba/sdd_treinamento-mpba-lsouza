import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import type { City } from '../../../src/types/weather';

const city: City = {
  name: 'Recife',
  latitude: -8.05,
  longitude: -34.9,
  region: 'Pernambuco',
  country: 'Brasil',
  timezone: 'America/Recife',
};

describe('CurrentWeather', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the weather icon, condition, city, and converted temperature', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: 20,
          apparentTemperatureC: 19,
          relativeHumidityPercent: 70,
          weatherCode: 3,
          observedAt: '2026-05-10T12:00',
        }}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Recife' })).toBeInTheDocument();
    expect(screen.getByText('68 °F')).toBeInTheDocument();
    expect(screen.getByText('Sensação: 66 °F')).toBeInTheDocument();
    expect(screen.getByText('Nublado')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows unavailable labels rather than inventing missing metrics', () => {
    render(<CurrentWeather city={city} current={{ weatherCode: 777 }} unit="celsius" />);

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Temperatura: Indisponível' })).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
  });

  it('marks observations older than 60 minutes as stale', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T16:01:00Z'));

    render(
      <CurrentWeather
        city={city}
        current={{ observedAt: '2026-05-10T12:00', weatherCode: 3 }}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Dados desatualizados');
  });

  it('does not mark an observation exactly 60 minutes old as stale', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T16:00:00Z'));

    render(
      <CurrentWeather
        city={city}
        current={{ observedAt: '2026-05-10T12:00', weatherCode: 3 }}
        unit="celsius"
      />,
    );

    expect(screen.queryByText('Dados desatualizados')).not.toBeInTheDocument();
    expect(screen.getByText('Referência temporal: 12:00')).toBeInTheDocument();
  });

  it('labels the observation time unavailable when the API omits it', () => {
    render(<CurrentWeather city={city} current={{ temperatureC: 20 }} unit="celsius" />);

    expect(screen.getByText('Referência temporal: Horário indisponível')).toBeInTheDocument();
  });
});
