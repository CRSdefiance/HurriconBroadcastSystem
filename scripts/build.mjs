import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'bundles/hurricon-broadcast');
if (process.argv[2] === 'clean') {
  rmSync(resolve(root, 'bundles'), { recursive: true, force: true });
  process.exit(0);
}
mkdirSync(out, { recursive: true });
const generatedPages = resolve(out, 'pages');
if (existsSync(resolve(generatedPages, 'dashboard'))) cpSync(resolve(generatedPages, 'dashboard'), resolve(out, 'dashboard'), { recursive: true });
if (existsSync(resolve(generatedPages, 'graphics'))) cpSync(resolve(generatedPages, 'graphics'), resolve(out, 'graphics'), { recursive: true });
rmSync(generatedPages, { recursive: true, force: true });
if (existsSync(resolve(out, 'assets'))) cpSync(resolve(out, 'assets'), resolve(out, 'shared/assets'), { recursive: true });
for (const name of ['brands', 'schemas']) cpSync(resolve(root, name), resolve(out, name), { recursive: true });
cpSync(resolve(root, 'configschema.json'), resolve(out, 'configschema.json'));
cpSync(resolve(root, 'brands'), resolve(out, 'shared/brands'), { recursive: true });
writeFileSync(resolve(out, 'package.json'), JSON.stringify({
  name: 'hurricon-broadcast', version: '0.1.0', description: 'Hurricon Broadcast System bundle',
  main: 'extension/index.js',
  nodecg: {
    compatibleRange: '^2.8.0',
    dashboardPanels: [
      { name: 'control', title: 'HBS Live Control', width: 10, file: 'index.html', headerColor: '#172554' },
      { name: 'setup', title: 'HBS Setup / Preview', width: 10, file: 'setup.html', headerColor: '#312e81' }
    ],
    graphics: [
      { file: 'tournament.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'show.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'speedrun.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'background.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'feed-backgrounds.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'interstitial.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'music-player.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'break.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'technical.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'lower-third.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'broadcast-rail.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'transition-overlay.html', width: 1920, height: 1080, singleInstance: false },
      { file: 'program-preview.html', width: 1920, height: 1080, singleInstance: false }
    ]
  }
}, null, 2));
const userConfig = resolve(root, 'config/hurricon-broadcast.json');
if (existsSync(userConfig)) {
  mkdirSync(resolve(root, 'cfg'), { recursive: true });
  cpSync(userConfig, resolve(root, 'cfg/hurricon-broadcast.json'));
}
