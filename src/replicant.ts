export function observe<T>(name: string, fallback: T, render: (value: T) => void): { get: () => T; set: (value: T) => void } {
  if (!window.nodecg) { render(fallback); let current = fallback; return { get: () => current, set: (value) => { current = value; render(value); } }; }
  const rep = window.nodecg.Replicant<T>(name);
  rep.on('change', (value) => { if (value !== undefined) render(value); });
  return { get: () => rep.value ?? fallback, set: (value) => { rep.value = value; } };
}

