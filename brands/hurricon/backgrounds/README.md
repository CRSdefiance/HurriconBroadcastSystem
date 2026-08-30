# Hurricon backgrounds

Place full-resolution PNG, JPEG, WEBP, or SVG background artwork in this folder. `brand.json` selects the files used by the dedicated OBS background layers:

- `assets.background`: full-canvas scene background
- `assets.feedBackground`: fallback shown inside each gameplay and runner-camera slot
- `assets.feed1Background` through `assets.feed4Background`: optional slot-specific overrides
- `assets.runnerBackground`: optional runner-camera override

The initial `hurricon-neon-grid.png` is a clean 16:9 background generated from the abstract visual language of a supplied Hurricon post. It contains no people, logos, dates, titles, posters, sponsor marks, or other foreground elements.

Add new files without overwriting prior art, then change the corresponding relative path in `brand.json` and click **Reload files** in HBS Control.
