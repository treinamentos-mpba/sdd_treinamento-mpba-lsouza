import { describe, expect, it } from 'vitest';
import { formatDayLabel, formatTime, getShortDate } from '../../src/lib/format';

describe('forecast formatting', () => {
  it('labels forecast indexes zero and one as today and tomorrow', () => {
    expect(formatDayLabel('2026-10-29', 0)).toBe('Hoje');
    expect(formatDayLabel('2026-10-30', 1)).toBe('Amanhã');
  });

  it('uses the weekday for later forecast indexes', () => {
    expect(formatDayLabel('2026-10-31', 2)).toBe('Sáb');
  });

  it('formats a short date and handles invalid dates', () => {
    expect(getShortDate('2026-10-29')).toBe('29/10');
    expect(getShortDate('2026-02-31')).toBe('Data indisponível');
  });

  it('formats an observed timestamp in the requested timezone and handles absence', () => {
    expect(formatTime('2026-05-10T12:00:00-03:00', 'America/Recife')).toBe('12:00');
    expect(formatTime(undefined, 'America/Recife')).toBe('Horário indisponível');
  });
});
