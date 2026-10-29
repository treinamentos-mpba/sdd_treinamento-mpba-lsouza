import type { Unit } from '../types/weather';

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function convertTemperature(valueC: number, unit: Unit): number {
  const converted = unit === 'fahrenheit' ? (valueC * 9) / 5 + 32 : valueC;
  return Math.round(converted);
}

export function formatTemperature(valueC: number | undefined, unit: Unit): string {
  if (valueC === undefined || !Number.isFinite(valueC)) {
    return 'Indisponível';
  }

  return `${convertTemperature(valueC, unit)} ${unitLabel(unit)}`;
}
