import type { SocialPlatform } from './types';

export const socialPlatforms: Array<{ value: SocialPlatform; label: string }> = [
  { value: 'twitch', label: 'Twitch' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'x', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'discord', label: 'Discord' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'other', label: 'Other' }
];

const icons: Record<SocialPlatform, string> = {
  twitch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h17v11l-5 5h-4l-3 3v-3H4V3Zm4 4v6h2V7H8Zm5 0v6h2V7h-2Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0 2.6-.3 4.3-.7 5.2-.4.8-1 1.4-1.9 1.6-1.7.4-7.4.4-7.4.4s-5.7 0-7.4-.4c-.9-.2-1.5-.8-1.9-1.6C2.3 16.3 2 14.6 2 12s.3-4.3.7-5.2c.4-.8 1-1.4 1.9-1.6C6.3 4.8 12 4.8 12 4.8s5.7 0 7.4.4c.9.2 1.5.8 1.9 1.6.4.9.7 2.6.7 5.2ZM10 8.6v6.8l5.7-3.4L10 8.6Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4.1l4.4 5.8L17.3 4H20l-6.2 7.1L20.5 20h-4.1l-4.9-6.4L5.9 20H3.2l6.9-7.9L4 4Zm3.2 2 9.4 12h1.7L8.9 6H7.2Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-3.1a1.05 1.05 0 1 1-1.05 1.05A1.05 1.05 0 0 1 17.2 6.4Z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h3c.3 2.1 1.5 3.5 3.5 3.7v3.1c-1.3 0-2.5-.4-3.5-1.1v6.1a6 6 0 1 1-5.1-5.9v3.2a2.9 2.9 0 1 0 2.1 2.8V3Z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 5.1A16 16 0 0 0 15.6 4l-.5 1a14.4 14.4 0 0 0-6.2 0l-.5-1A16 16 0 0 0 4.5 5.1C2 8.8 1.3 12.4 1.7 16a16 16 0 0 0 4.8 2.4l1.2-1.6-1.5-.7.4-.3c2.9 1.3 6.1 1.3 9 0l.4.3-1.5.7 1.2 1.6a16 16 0 0 0 4.8-2.4c.5-4.1-.8-7.7-3-10.9ZM8.6 14.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>',
  bluesky: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 10.5C10 6.8 6.8 4.1 4 2.1 1.3.2.5.6.2 1.8c-.3 1.4.5 4.8 1.2 6.1.9 1.7 3.8 3.6 6.4 3.3-2.5.4-5.2 1.5-6.2 3.3-.8 1.4-1.4 5-.8 6.2.3 1.2 1.2 1.6 3.8-.2 2.8-2 5.5-5.1 7.4-8.8 1.9 3.7 4.6 6.8 7.4 8.8 2.6 1.8 3.5 1.4 3.8.2.6-1.2 0-4.8-.8-6.2-1-1.8-3.7-2.9-6.2-3.3 2.6.3 5.5-1.6 6.4-3.3.7-1.3 1.5-4.7 1.2-6.1-.3-1.2-1.1-1.6-3.8.3-2.8 2-6 4.7-8 8.3Z"/></svg>',
  other: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.9 9h-3.1a15.8 15.8 0 0 0-1.2-5A8 8 0 0 1 18.9 11ZM12 4c.9 1.3 1.5 3.5 1.7 7h-3.4c.2-3.5.8-5.7 1.7-7ZM9.4 6a15.8 15.8 0 0 0-1.2 5H5.1A8 8 0 0 1 9.4 6ZM5.1 13h3.1a15.8 15.8 0 0 0 1.2 5A8 8 0 0 1 5.1 13Zm6.9 7c-.9-1.3-1.5-3.5-1.7-7h3.4c-.2 3.5-.8 5.7-1.7 7Zm2.6-2a15.8 15.8 0 0 0 1.2-5h3.1a8 8 0 0 1-4.3 5Z"/></svg>'
};

export const normalizeSocialHandle = (value?: string) => {
  const input = (value ?? '').trim();
  if (!input) return '';
  try {
    const url = new URL(input.includes('://') ? input : `https://${input}`);
    if (url.hostname.includes('.')) return url.pathname.split('/').filter(Boolean).pop() || input;
  } catch { /* keep a typed handle */ }
  return input.replace(/^@/, '');
};

export const renderSocialIcon = (selector: string, platform?: SocialPlatform) => {
  let element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    const socialValue = selector.replace('-icon', '');
    const value = document.querySelector<HTMLElement>(socialValue);
    const parent = value?.parentElement;
    const label = parent?.querySelector<HTMLElement>('span, em');
    if (label) {
      element = label;
      element.setAttribute('data-social-icon', '');
    }
  }
  if (!element) return;
  const selected = platform ?? 'other';
  element.dataset.platform = selected;
  element.innerHTML = icons[selected];
  element.setAttribute('aria-label', socialPlatforms.find((item) => item.value === selected)?.label ?? 'Social');
  element.style.display = 'inline-grid';
  element.style.placeItems = 'center';
  element.style.width = '30px';
  element.style.height = '30px';
  element.style.color = 'var(--brand-secondary)';
  element.style.flex = '0 0 auto';
  const svg = element.querySelector<SVGElement>('svg');
  if (svg) { svg.style.width = '100%'; svg.style.height = '100%'; svg.style.fill = 'currentColor'; }
};
