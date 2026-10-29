import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../../src/components/ForecastList';
import type { ForecastDay } from '../../../src/types/weather';

const forecast: ForecastDay[] = [
  {
    date: '2026-05-10',
    weatherCode: 3,
    temperatureMaxC: 20,
    temperatureMinC: 12,
    precipitationProbabilityMaxPercent: 10,
  },
  {
    date: '2026-05-11',
    weatherCode: 1,
    temperatureMaxC: 21,
    temperatureMinC: 13,
    precipitationProbabilityMaxPercent: 20,
  },
  {
    date: '2026-05-12',
    weatherCode: 61,
    temperatureMaxC: 18,
    temperatureMinC: 11,
    precipitationProbabilityMaxPercent: 70,
  },
  {
    date: '2026-05-13',
    weatherCode: 2,
    temperatureMaxC: 22,
    temperatureMinC: 14,
    precipitationProbabilityMaxPercent: 0,
  },
  {
    date: '2026-05-14',
    weatherCode: 0,
    temperatureMaxC: 23,
    temperatureMinC: 15,
    precipitationProbabilityMaxPercent: 5,
  },
];

describe('ForecastList', () => {
  it('renders five forecast cards with local day labels and converted temperatures', () => {
    render(<ForecastList days={forecast} unit="fahrenheit" />);

    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Máx. 68 °F')).toBeInTheDocument();
    expect(screen.getByText('Mín. 54 °F')).toBeInTheDocument();
    expect(screen.getByText('Chuva: 70%')).toBeInTheDocument();
    expect(screen.getByText('Hoje')).toBeInTheDocument();
  });

  it('renders an empty-state message when no forecast days are available', () => {
    render(<ForecastList days={[]} unit="celsius" />);

    expect(screen.getByText('Previsão indisponível.')).toBeInTheDocument();
  });
});
