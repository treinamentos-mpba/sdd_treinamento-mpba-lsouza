import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature helpers', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %i°C to %i°F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('respects the selected unit', () => {
    expect(convertTemperature(20, 'celsius')).toBe(20);
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });

  it('rounds before formatting and appends the unit symbol', () => {
    expect(formatTemperature(20.6, 'celsius')).toBe('21 °C');
    expect(formatTemperature(20, 'fahrenheit')).toBe('68 °F');
    expect(formatTemperature(undefined, 'celsius')).toBe('Indisponível');
  });

  it('returns the unit label', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
