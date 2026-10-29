import { type KeyboardEvent, useRef } from 'react';
import { unitLabel } from '../lib/temperature';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Unit[] = ['celsius', 'fahrenheit'];
export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % units.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + units.length) % units.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = units.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextUnit = units[nextIndex];
    onChange(nextUnit);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      {units.map((option, index) => (
        <button
          key={option}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          type="button"
          aria-pressed={unit === option}
          tabIndex={unit === option ? 0 : -1}
          onClick={() => onChange(option)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={`min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
            unit === option
              ? 'bg-accent-400 text-night-900'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {unitLabel(option)}
        </button>
      ))}
    </div>
  );
}
