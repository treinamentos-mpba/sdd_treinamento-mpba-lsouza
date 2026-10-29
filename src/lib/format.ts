const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseLocalDate(value: string): Date | undefined {
  const match = datePattern.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return undefined;
  }

  return date;
}

export function formatDate(value: string): string {
  const match = datePattern.exec(value);
  if (!match) return 'Data indisponível';

  const [, year, month, day] = match;
  const date = parseLocalDate(value);
  return date ? `${day}/${month}/${year}` : 'Data indisponível';
}

export function formatDayLabel(value: string, index?: number): string {
  const date = parseLocalDate(value);
  if (!date) return 'Dia indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date);

  return label.charAt(0).toLocaleUpperCase('pt-BR') + label.slice(1).replace(/\.$/, '');
}

export function getShortDate(value: string): string {
  const date = parseLocalDate(value);
  if (!date) return 'Data indisponível';

  const [, , month, day] = date.toISOString().match(/^(\d{4})-(\d{2})-(\d{2})T/) ?? [];
  return month && day ? `${day}/${month}` : 'Data indisponível';
}

export function formatTime(value: string | undefined, timezone?: string): string {
  if (!value) return 'Horário indisponível';

  const localTime = /T(\d{2}:\d{2})/.exec(value)?.[1];
  if (!localTime) return 'Horário indisponível';

  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) || !timezone) {
    return localTime;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Horário indisponível';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: timezone,
    }).format(date);
  } catch {
    return 'Horário indisponível';
  }
}

function parseLocalDateTime(value: string, timezone: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return undefined;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = '0'] = match;
  const targetParts = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const targetTimestamp = Date.UTC(
    targetParts[0],
    targetParts[1] - 1,
    targetParts[2],
    targetParts[3],
    targetParts[4],
    targetParts[5],
  );
  let timestamp = targetTimestamp;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const parts = formatter.formatToParts(new Date(timestamp));
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      const representedTimestamp = Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
        Number(values.hour),
        Number(values.minute),
        Number(values.second),
      );
      const difference = targetTimestamp - representedTimestamp;
      if (difference === 0) return new Date(timestamp);
      timestamp += difference;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function isObservationStale(
  observedAt: string | undefined,
  timezone: string | undefined,
  referenceTime = new Date(),
): boolean | undefined {
  if (!observedAt) return undefined;

  const hasOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(observedAt);
  const observation = hasOffset
    ? new Date(observedAt)
    : timezone
      ? parseLocalDateTime(observedAt, timezone)
      : undefined;

  if (!observation || Number.isNaN(observation.getTime())) return undefined;
  return referenceTime.getTime() - observation.getTime() > 60 * 60 * 1000;
}
