import { describe, expect, it } from 'vitest';
import { getWeatherPresentation } from '../../src/lib/weatherCodes';

describe('getWeatherPresentation', () => {
  it('maps a known WMO code to its icon and label', () => {
    expect(getWeatherPresentation(3)).toEqual({ icon: '☁', label: 'Nublado' });
  });

  it('falls back for unknown and missing codes', () => {
    expect(getWeatherPresentation(777)).toEqual({ icon: '—', label: 'Condição indisponível' });
    expect(getWeatherPresentation(undefined)).toEqual({
      icon: '—',
      label: 'Condição indisponível',
    });
  });
});
