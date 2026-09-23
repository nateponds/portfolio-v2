const MODES = new Set(['day', 'sunset', 'night']);
const listeners = new Set();
let selected = null;

export function getSkyMode() {
  return selected;
}

export function setSkyMode(mode) {
  const next = MODES.has(mode) ? mode : null;
  if (next === selected) return;
  selected = next;
  listeners.forEach((listener) => listener(selected));
}

export function subscribeSkyMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
