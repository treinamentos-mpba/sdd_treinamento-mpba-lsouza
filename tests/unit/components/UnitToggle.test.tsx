import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import type { Unit } from '../../../src/types/weather';

describe('UnitToggle', () => {
  it('exposes the selected unit through aria-pressed', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('changes unit on activation and supports arrow-key navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    const celsiusButton = screen.getByRole('button', { name: '°C' });
    const fahrenheitButton = screen.getByRole('button', { name: '°F' });
    await user.click(celsiusButton);
    expect(onChange).toHaveBeenCalledWith('celsius');

    celsiusButton.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
    expect(fahrenheitButton).toHaveFocus();
  });

  it('converts CurrentWeather from 0°C to 32°F when Fahrenheit is selected', async () => {
    function WeatherWithUnitToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');
      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather
            city={{ name: 'Recife', latitude: -8, longitude: -34 }}
            current={{ temperatureC: 0, weatherCode: 0 }}
            unit={unit}
          />
        </>
      );
    }

    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByRole('group', { name: 'Temperatura: 32 °F' })).toBeInTheDocument();
  });
});
