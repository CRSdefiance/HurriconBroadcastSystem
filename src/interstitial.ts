import type { InterstitialState, MusicState, RainwaveStation, ShowMode } from './types';

export const rainwaveStations: RainwaveStation[] = [
  { id: 1, key: 'game', name: 'Game', description: 'Original video game soundtracks' },
  { id: 2, key: 'ocremix', name: 'OC ReMix', description: 'OverClocked ReMix radio' },
  { id: 3, key: 'covers', name: 'Covers', description: 'Official and fan-made covers' },
  { id: 4, key: 'chiptune', name: 'Chiptunes', description: 'Game and original chiptunes' },
  { id: 5, key: 'all', name: 'All', description: 'All Rainwave stations combined' },
  { id: 6, key: 'chill', name: 'Chill', description: 'Relaxing video game music' }
];

export const defaultMusic = (): MusicState => ({ source: 'rainwave', rainwaveStation: 'all', localFolder: 'chill', volume: 0.72, fadeMs: 1200, autoWithInterstitial: true, playing: false, status: 'stopped', updatedAt: Date.now() });
export const defaultInterstitial = (): InterstitialState => ({
  automatic: true,
  rotationSeconds: 12,
  activeIndex: 0,
  slides: [
    { id: 'welcome', enabled: true, kicker: 'Welcome to Hurricon', title: 'Programming resumes shortly', body: 'Visit the event floor, meet our partners, and stay tuned for the next featured event.' },
    { id: 'partners', enabled: true, kicker: 'Thank you', title: 'Support our event partners', body: 'Their support helps make this broadcast and community event possible.' }
  ],
  updatedAt: Date.now()
});

export const normalizeMusic = (value?: Partial<MusicState>): MusicState => {
  const fallback = defaultMusic();
  return {
    ...fallback,
    ...value,
    source: value?.source === 'local' ? 'local' : 'rainwave',
    rainwaveStation: String(value?.rainwaveStation || fallback.rainwaveStation),
    localFolder: String(value?.localFolder || fallback.localFolder),
    volume: Math.min(1, Math.max(0, Number(value?.volume ?? fallback.volume))),
    fadeMs: Math.min(10000, Math.max(0, Number(value?.fadeMs ?? fallback.fadeMs))),
    autoWithInterstitial: value?.autoWithInterstitial !== false,
    playing: Boolean(value?.playing),
    updatedAt: Number(value?.updatedAt) || Date.now()
  };
};

export const automaticMusicAction = (previousMode: ShowMode, nextMode: ShowMode, music: MusicState): 'play' | 'stop' | undefined => {
  if (!music.autoWithInterstitial || previousMode === nextMode) return undefined;
  if (nextMode === 'interstitial' && !music.playing) return 'play';
  if (previousMode === 'interstitial' && music.playing) return 'stop';
  return undefined;
};

export const normalizeInterstitial = (value?: Partial<InterstitialState>): InterstitialState => {
  const fallback = defaultInterstitial();
  const slides = Array.isArray(value?.slides) ? value.slides.slice(0, 24).map((slide, index) => ({ id: String(slide.id || `slide-${index + 1}`), enabled: slide.enabled !== false, kicker: String(slide.kicker || ''), title: String(slide.title || ''), body: String(slide.body || ''), imageUrl: String(slide.imageUrl || '') || undefined, imageFit: slide.imageFit === 'cover' ? 'cover' as const : 'contain' as const })) : fallback.slides;
  return { automatic: value?.automatic !== false, rotationSeconds: Math.min(300, Math.max(3, Number(value?.rotationSeconds) || fallback.rotationSeconds)), activeIndex: Math.max(0, Number(value?.activeIndex) || 0), slides, updatedAt: Number(value?.updatedAt) || Date.now() };
};
