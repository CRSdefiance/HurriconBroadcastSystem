import type { Brand } from './types';

const cssMap: Record<string, string> = { primary:'--brand-primary', secondary:'--brand-secondary', accent:'--brand-accent', background:'--brand-bg', panel:'--brand-panel', text:'--brand-text', mutedText:'--brand-muted', player1:'--brand-player-1', player2:'--brand-player-2', success:'--brand-success', warning:'--brand-warning' };
export function applyBrand(brand: Brand): void {
  const root = document.documentElement;
  for (const [key, css] of Object.entries(cssMap)) root.style.setProperty(css, brand.colors[key]);
  root.style.setProperty('--brand-heading', brand.typography.headingFamily);
  root.style.setProperty('--brand-body', brand.typography.bodyFamily);
  root.style.setProperty('--brand-numeric', brand.typography.numericFamily);
  root.style.setProperty('--brand-radius', `${brand.shape.cornerRadius}px`);
  root.style.setProperty('--brand-border-width', `${brand.shape.borderWidth}px`);
  root.style.setProperty('--brand-panel-opacity', String(brand.shape.panelOpacity));
  root.style.setProperty('--brand-animation-ms', brand.animation.reducedMotion ? '0ms' : `${brand.animation.durationMs}ms`);
}
export const assetUrl = (brand: Brand, asset: string): string => {
  const folder = brand.id === 'template' ? '_template' : brand.id;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return import.meta.env.DEV ? `${base}/${folder}/${asset}` : `${base}/brands/${folder}/${asset}`;
};
