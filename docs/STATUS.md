# Implementation status

## Working vertical slice

- NodeCG 2.8.0 local runtime and generated bundle
- Validated `_template`, `game-grove`, and `hurricon` data-only brands
- Live dashboard/graphic Replicant synchronization
- Match apply, score bounds, swap, reset confirmation, and status controls
- Tournament, flexible one-to-four-feed speedrun/gameplay, gameplay/show, break, technical, and lower-third graphics
- Optional runner camera, setup guides, run metadata, and persistent start/pause/reset timer
- Per-feed speedrun runner/pronoun/social rails with independent visibility and rotating socials
- Tournament pronoun/location separation and automatic social rotation
- Current/up-next and lower-third controls
- Reusable global broadcast rail with synchronized automatic/manual rotation, safe blank, donation progress, approved latest-donation details, sponsors, announcements, and now/up-next programming
- Server-only authenticated OBS WebSocket v5 connection, scene switching, status, and exponential reconnect
- Configurable Fade or custom Stinger scene transitions, per-destination overrides, dashboard selection, and Cut fallback
- Mock preview data, brand creation/fetch scripts, unit tests, and operator documentation

## Next V1 modules

- Sponsor folder discovery/import and external donation-provider adapters
- Schedule file watcher/UI and schedule graphic
- Commentator editor (graphic state model is present)
- OBS scene/browser-source provisioner and logical feed mapping
- Diagnostic export and rendering smoke automation
- Interview/stage-specific compositions and manual OBS restart acceptance run

## Acceptance evidence (2026-08-28)

TypeScript browser/extension checks passed; production bundle built; 11 unit tests passed; NodeCG mounted the extension and served dashboard, graphic, shared JavaScript, and brand assets with HTTP 200. The tournament graphic and speedrun/gameplay compositions were visually checked at 1920×1080. Dashboard selection changed the live graphic from Game Grove to Hurricon without source edits. OBS was not running in this environment, so the expected disconnected/retry state was verified, but a real scene-switch acceptance test remains.
