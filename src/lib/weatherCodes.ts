export interface WeatherPresentation {
  icon: string;
  label: string;
}

const presentations: Record<number, WeatherPresentation> = {
  0: { icon: '☀', label: 'Céu limpo' },
  1: { icon: '🌤', label: 'Predominantemente limpo' },
  2: { icon: '⛅', label: 'Parcialmente nublado' },
  3: { icon: '☁', label: 'Nublado' },
  45: { icon: '🌫', label: 'Nevoeiro' },
  48: { icon: '🌫', label: 'Nevoeiro com geada' },
  51: { icon: '🌦', label: 'Garoa fraca' },
  53: { icon: '🌦', label: 'Garoa moderada' },
  55: { icon: '🌧', label: 'Garoa intensa' },
  56: { icon: '🌧', label: 'Garoa congelante fraca' },
  57: { icon: '🌧', label: 'Garoa congelante intensa' },
  61: { icon: '🌧', label: 'Chuva fraca' },
  63: { icon: '🌧', label: 'Chuva moderada' },
  65: { icon: '🌧', label: 'Chuva intensa' },
  66: { icon: '🌧', label: 'Chuva congelante fraca' },
  67: { icon: '🌧', label: 'Chuva congelante intensa' },
  71: { icon: '🌨', label: 'Neve fraca' },
  73: { icon: '🌨', label: 'Neve moderada' },
  75: { icon: '❄', label: 'Neve intensa' },
  77: { icon: '❄', label: 'Grãos de neve' },
  80: { icon: '🌦', label: 'Pancadas de chuva fracas' },
  81: { icon: '🌧', label: 'Pancadas de chuva moderadas' },
  82: { icon: '🌧', label: 'Pancadas de chuva intensas' },
  85: { icon: '🌨', label: 'Pancadas de neve fracas' },
  86: { icon: '🌨', label: 'Pancadas de neve intensas' },
  95: { icon: '⛈', label: 'Trovoada' },
  96: { icon: '⛈', label: 'Trovoada com granizo fraco' },
  99: { icon: '⛈', label: 'Trovoada com granizo intenso' },
};

export function getWeatherPresentation(code: number | undefined): WeatherPresentation {
  if (code === undefined) {
    return { icon: '—', label: 'Condição indisponível' };
  }

  return presentations[code] ?? { icon: '—', label: 'Condição indisponível' };
}
