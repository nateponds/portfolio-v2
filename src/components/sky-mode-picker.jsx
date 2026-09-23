'use client';

import { useEffect, useState } from 'react';
import { getSkyMode, setSkyMode, subscribeSkyMode } from '@/lib/sky/mode';

const MODES = [
  { id: 'day', label: 'Day sky' },
  { id: 'sunset', label: 'Sunset sky' },
  { id: 'night', label: 'Night sky' },
];

export function SkyModePicker() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const root = document.documentElement;

    function syncFromScene() {
      if (getSkyMode()) return;
      setMode(root.dataset.skyPhase || null);
    }

    const initialSync = requestAnimationFrame(() => {
      setMode(getSkyMode() || root.dataset.skyPhase || null);
    });

    const unsubscribe = subscribeSkyMode((next) => {
      if (next) setMode(next);
    });
    const observer = new MutationObserver(syncFromScene);
    observer.observe(root, { attributes: true, attributeFilter: ['data-sky-phase'] });

    return () => {
      cancelAnimationFrame(initialSync);
      unsubscribe();
      observer.disconnect();
    };
  }, []);

  return (
    <div className="sky-mode-picker" role="radiogroup" aria-label="Sky time of day">
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className="sky-mode-dot"
          data-mode={id}
          role="radio"
          aria-checked={mode === id}
          aria-label={label}
          onClick={() => setSkyMode(id)}
        />
      ))}
    </div>
  );
}
