# OBS setup

Use OBS Studio 28 or later, where obs-websocket is built in. In **Tools → WebSocket Server Settings**, enable the server and authentication, retain the normal port `4455`, and copy the password into ignored `config/hurricon-broadcast.json`. Never commit that file or expose port 4455 to the public Internet.

Create scenes matching the `sceneMap` names in the config. Add each HBS graphic as a 1920×1080 Browser Source using the URLs listed in HBS Control. Keep capture feeds below transparent HBS browser graphics. The dashed preview rectangles are transparent in OBS and are alignment guides only.

## Global broadcast rail

Create a reusable OBS scene named **HBS - Global Rail**. Add one 1920×1080 Browser Source using:

- URL: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/broadcast-rail.html`
- Width: `1920`
- Height: `1080`
- **Shutdown source when not visible**: off
- **Refresh browser when scene becomes active**: off

Add **HBS - Global Rail** as a nested scene at the top of every program scene where the rail should be available. Do not crop the Browser Source; the page is transparent except for the bottom rail. HBS layouts reserve the bottom safe zone so the rail does not cover gameplay, tournament metadata, or the speedrun timer. Use **Safe blank** in HBS Control when the rail should disappear without modifying OBS.

The rail rotates donation progress, approved latest-donation details, sponsors, announcements, and now/up-next programming. Rotation is server-owned, so every OBS/browser instance displays the same module. Logo fields accept an HTTPS URL or a bundle URL beginning with `/bundles/`; invalid paths fall back to a text-only sponsor card.

## Speedrun / gameplay scene

Create or select the scene mapped as `gameplay` (the example config calls it **HBS - Gameplay Show**). Add a Browser Source named **HBS - Speedrun Overlay** with:

- URL: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/speedrun.html`
- Width: `1920`
- Height: `1080`
- **Shutdown source when not visible**: off
- **Refresh browser when scene becomes active**: off

For a normal web-browser preview with the scene and feed backgrounds composited behind an overlay, append `?background=1` to any graphic URL. This convention works for tournament, speedrun/gameplay, interview/exhibition camera show, break, technical, and lower-third views. Do not use that query option for a top OBS overlay source above live video because the composite preview is intentionally opaque.

Graphics allow multiple simultaneous instances, so an OBS Browser Source and ordinary browser previews can remain open together and receive the same live Replicant updates.

Add up to four Display Capture, Window Capture, Game Capture, or capture-card sources and one Video Capture Device for the runner camera. In the Sources list, keep the HBS browser source at the top and every video source underneath it. In HBS Control, enable **Setup labels**, choose the feed count and runner-camera option, then resize/crop each video source into its labeled frame. `Alt`-drag an OBS source edge to crop it, drag normally to resize, and lock each source after placement. Disable **Setup labels** before going live; the borders remain as the finished framing treatment while the labels disappear.

HBS also provides two optional branded background Browser Sources. Add both at 1920×1080 using these URLs:

- **HBS - Feed Backgrounds**: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/feed-backgrounds.html`
- **HBS - Scene Background**: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/background.html`

Use this exact top-to-bottom source order:

1. HBS speedrun overlay
2. Runner camera and game captures
3. HBS feed backgrounds
4. HBS scene background

The feed-background layer follows the same one-to-four-feed and runner-camera geometry as the overlay. It acts as a branded fallback beneath each capture; it never covers a working capture source. The scene background fills everything behind the composition.

For a single-PC test with your second monitor, add **Display Capture**, choose the second display, place it below **HBS - Speedrun Overlay**, and fit/crop it into **GAME 1**. The OBS preview shows the captured monitor through the transparent center of the overlay.

Recommended canvas/output is 1920×1080 at 60 fps. Split console HDMI before capture so players use a low-latency display, not the OBS preview. Keep game, commentator, and room audio as separate mixer/interface or OBS inputs when possible.

## Scene transitions

HBS selects an OBS transition immediately before each dashboard scene change. The default is **Fade** at 500 ms. When OBS is connected, HBS Control lists the transitions in the active OBS scene collection; select one, enter a duration, and click **Apply transition**. Fixed-duration transitions ignore the duration field.

To create a GDQ-style branded transition, open OBS's **Scene Transitions** dock, click **+**, choose **Stinger**, select a short video with transparency, configure its transition point, and give it a clear name such as `HBS Stinger`. It then appears in the HBS dashboard selector. Keep **Shutdown source when not visible** disabled on HBS Browser Sources so the destination graphic is already loaded when a transition begins.

The default and optional destination-specific overrides can also be placed in ignored `config/hurricon-broadcast.json`:

```json
"transition": { "name": "Fade", "durationMs": 500 },
"transitionMap": {
  "break": { "name": "HBS Stinger" },
  "technical": { "name": "Fade", "durationMs": 750 }
}
```

`transitionMap` is keyed by the destination show mode. Dashboard selection overrides these settings for the current HBS session. If a configured transition is unavailable, HBS attempts **Cut** and still completes the scene change.

For a production PC on a wired LAN, replace `127.0.0.1` in the OBS URL with that PC's private address and permit only the relevant private network in Windows Firewall. Do not port-forward OBS or NodeCG. A red dashboard status means HBS is retrying every three seconds; confirm OBS is running, the URL/password match, authentication is enabled, and the expected scene names exist.
