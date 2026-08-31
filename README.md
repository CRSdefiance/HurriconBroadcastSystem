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

Current pilot features: separate compact Live Control and Setup / Preview panels; a layered browser-only Program Preview; tournament with rotating player details/socials; flexible one-to-four-feed speedrun/gameplay layouts; runner identities, camera and timer; branded background layers; gameplay/show, break, technical and lower-third graphics; a global donation/sponsor/programming rail; brand switching; configurable OBS Fade/Stinger transitions; asset-free Corner, Diagonal and Iris transition overlays with midpoint scene cuts; and authenticated OBS scene switching with retry. Placeholder SVG marks are deliberately non-official and can be replaced without code edits.
