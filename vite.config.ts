import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  root: '.',
  base: '/bundles/hurricon-broadcast/shared/',
  publicDir: command === 'serve' ? 'brands' : false,
  build: {
    emptyOutDir: true,
    outDir: 'bundles/hurricon-broadcast',
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'pages/dashboard/index.html'),
        tournament: resolve(__dirname, 'pages/graphics/tournament.html'),
        show: resolve(__dirname, 'pages/graphics/show.html'),
        speedrun: resolve(__dirname, 'pages/graphics/speedrun.html'),
        background: resolve(__dirname, 'pages/graphics/background.html'),
        feedBackgrounds: resolve(__dirname, 'pages/graphics/feed-backgrounds.html'),
        interstitial: resolve(__dirname, 'pages/graphics/interstitial.html'),
        musicPlayer: resolve(__dirname, 'pages/graphics/music-player.html'),
        break: resolve(__dirname, 'pages/graphics/break.html'),
        technical: resolve(__dirname, 'pages/graphics/technical.html'),
        lowerThird: resolve(__dirname, 'pages/graphics/lower-third.html'),
        broadcastRail: resolve(__dirname, 'pages/graphics/broadcast-rail.html'),
        transitionOverlay: resolve(__dirname, 'pages/graphics/transition-overlay.html'),
        setup: resolve(__dirname, 'pages/dashboard/setup.html'),
        programPreview: resolve(__dirname, 'pages/graphics/program-preview.html')
      }
    }
  }
}));
