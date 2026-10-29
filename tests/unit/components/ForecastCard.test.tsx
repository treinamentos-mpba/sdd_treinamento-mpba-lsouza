import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../../src/components/ForecastCard';

describe('ForecastCard', () => {
  it('renders a day label, weather icon, temperatures, and precipitation chance', () => {
    render(
      <ol>
        <ForecastCard
          day={{
            date: '2026-05-10',
            weatherCode: 3,
            temperatureMaxC: 20,
            temperatureMinC: 12,
            precipitationProbabilityMaxPercent: 25,
          }}
          index={0}
          unit="celsius"
        />
      </ol>,
    );

    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Nublado' })).toBeInTheDocument();
    expect(screen.getByText('Máx. 20 °C')).toBeInTheDocument();
    expect(screen.getByText('Mín. 12 °C')).toBeInTheDocument();
    expect(screen.getByText('Chuva: 25%')).toBeInTheDocument();
  });

  it('shows unavailable values for a date with no weather data', () => {
    render(
      <ol>
        <ForecastCard day={{ date: '2026-05-10' }} index={0} unit="celsius" />
      </ol>,
    );

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getByText('Máx. Indisponível')).toBeInTheDocument();
    expect(screen.getByText('Mín. Indisponível')).toBeInTheDocument();
    expect(screen.getByText('Chuva: Indisponível')).toBeInTheDocument();
  });
});
