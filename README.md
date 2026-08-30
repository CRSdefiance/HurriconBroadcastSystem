# Hurricon Broadcast System

HBS is a local-first NodeCG broadcast package for Game Grove and Hurricon. It provides operator controls, synchronized browser graphics, data-only brand packs, and server-side OBS WebSocket v5 scene switching.

## Start

Install Node.js 24 (Node.js 22 is also supported), then:

```powershell
npm install
Copy-Item config/hurricon-broadcast.example.json config/hurricon-broadcast.json
npm run dev
```

Open `http://127.0.0.1:9090`. Graphic URLs are listed in HBS Control. See [Quickstart](docs/QUICKSTART.md), [branding](docs/BRANDING.md), [OBS setup](docs/OBS_SETUP.md), and the [operator guide](docs/OPERATOR_GUIDE.md).

Current pilot features: tournament with rotating player details/socials, flexible speedrun/gameplay layouts for one to four 16:9 feeds, independent per-feed runner/pronoun/social rails, optional runner camera and timer, branded scene and per-feed fallback background layers, gameplay/show, break, technical-difficulties and lower-third graphics; match/score/swap control; brand switching; current/up-next content; configurable OBS Fade/Stinger transitions with safe fallback; authenticated OBS scene switching with retry. Placeholder SVG marks are deliberately non-official and can be replaced without code edits.
