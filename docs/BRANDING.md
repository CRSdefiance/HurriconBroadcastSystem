# Branding

## Switch brands

Select a brand under **Brand settings**, click **Select brand**, then refresh any OBS Browser Source whose cache prevents an immediate asset refresh.

## Create a brand

Run `npm run brand:new -- "My Event"`. The command copies `brands/_template`, creates a safe slug, and prints the files to edit. Replace `assets/logo-primary.svg` and `assets/logo-mark.svg`; PNG, JPG/JPEG, WEBP, and SVG are supported. Edit only `brand.json` to set names and colors. No TypeScript, HTML, or CSS change is needed.

Use six-digit hex colors. Asset paths must stay inside the brand folder; traversal paths are rejected. A basic pack needs only the JSON and two logos. Missing decorative assets produce warnings instead of crashing graphics.

## Background artwork

Each brand can contain a `backgrounds` folder. Add full-resolution 16:9 PNG, JPEG, WEBP, or SVG files and select them in `brand.json`:

```json
"assets": {
  "background": "backgrounds/my-scene-background.png",
  "feedBackground": "backgrounds/my-feed-background.png"
}
```

`background` drives the dedicated full-canvas OBS background source. `feedBackground` fills the one-to-four gameplay and runner-camera fallback slots. If `feedBackground` is omitted, it uses `background`; if both are omitted, HBS uses its safe CSS gradient. The Hurricon pack includes `backgrounds/hurricon-neon-grid.png` as the first generic background.

For distinct slot artwork, add optional `feed1Background`, `feed2Background`, `feed3Background`, `feed4Background`, or `runnerBackground` entries. Any slot without an override inherits `feedBackground`.

To add sponsors, place image files in the brand's `assets/sponsors` folder. Sponsor discovery/rotation is represented in the current core library and is the next operator UI module; the V0.1 break screen currently shows its safe placeholder.

If `brand.json` breaks, compare it with `_template/brand.json`, fix the warning shown in Settings, and click **Reload files**. An invalid reload leaves the prior valid brand on air.
