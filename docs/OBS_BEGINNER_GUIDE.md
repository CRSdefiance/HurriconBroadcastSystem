# Hurricon Broadcast System: OBS beginner guide

This guide assumes you have never used OBS Studio. It explains how to connect HBS (the Hurricon Broadcast System) to OBS, build the scenes, place your gameplay and camera feeds, and test everything before going live.

## What the pieces do

Think of the system as three parts:

1. **HBS / NodeCG** stores the show information and controls the graphics.
2. **OBS** combines browser graphics, gameplay captures, cameras, microphones, and transitions.
3. **The stream output** is the final OBS canvas sent to Twitch, YouTube, or a recording.

HBS does not receive video from OBS. OBS receives your video sources; HBS supplies transparent graphics and the controls that change them.

## 1. Start HBS first

Open PowerShell in the project folder and run:

```powershell
npm.cmd run dev
```

If PowerShell cannot run `npm.ps1`, use `npm.cmd` exactly as shown. Once the terminal says NodeCG is running, open:

`http://127.0.0.1:9090/dashboard/`

Leave this terminal open during the broadcast. Do not launch a second copy. If you see `EADDRINUSE ... 9090`, another copy is already running; use the existing dashboard or close the old Node process before starting again.

The NodeCG Workspace opens HBS Live Control and HBS Setup / Preview at the largest supported panel width so their forms remain readable. You can drag panels to rearrange them or use the panel's maximize button. Use the links between Live Control and Setup inside the Workspace; do not pop those two control panels into `standalone=true` browser windows, because a detached panel has no live Replicant connection. Graphic preview links may safely open in separate browser tabs.

## 2. Configure OBS WebSocket

HBS uses OBS WebSocket to change scenes when you press a scene button in Live Control.

1. Open OBS Studio 28 or later.
2. Select **Tools → WebSocket Server Settings**.
3. Check **Enable WebSocket server**. This checkbox must be enabled; a password alone does not start the server.
4. Leave the server port at **4455**.
5. Check **Enable Authentication**, create a password, and save it somewhere safe.
6. Copy `config/hurricon-broadcast.example.json` to `config/hurricon-broadcast.json`.
7. Put your password in the `obs.password` field. Do not commit this file or share it publicly.
8. Restart HBS after changing the configuration.

The dashboard should change from **OBS disconnected** to **OBS connected**. A disconnected status does not prevent browser graphics from rendering, but the scene buttons will not switch OBS until the connection is fixed.

## 3. Set the OBS video format

Open **Settings → Video** and use:

- Base (Canvas) Resolution: **1920×1080**
- Output (Scaled) Resolution: **1920×1080**
- Common FPS Value: **60** (30 is also acceptable if every source uses 30)

Open **Settings → Audio** and select the microphone, mixer, or interface you intend to use. Keep game, microphone, commentator, and room audio as separate sources when possible; this makes muting and balancing much easier.

## 4. Create the HBS scenes

The example configuration expects these exact OBS scene names:

| HBS mode | OBS scene name |
| --- | --- |
| Tournament | `HBS - Tournament` |
| Speedrun / Gameplay | `HBS - Gameplay Show` |
| Interview / Exhibition | `HBS - Interview` |
| Stage / Panel | `HBS - Stage` |
| Interstitial | `HBS - Interstitial` |
| Break | `HBS - Break` |
| Schedule | `HBS - Schedule` |
| Technical difficulties | `HBS - Technical` |

To create one, click the **+** button in the Scenes dock, type the name exactly, and click **OK**. Create all eight now, even if you only need one today. The Live Control buttons use these names from `sceneMap`. If your existing private config does not contain an `interstitial` entry, HBS uses `HBS - Interstitial` as its safe default.

## 5. Add the reusable global layers

Create a scene named **HBS - Global Rail**. Add a **Browser** source named `HBS Global Rail` with:

- URL: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/broadcast-rail.html`
- Width: `1920`
- Height: `1080`
- Shutdown source when not visible: **off**
- Refresh browser when scene becomes active: **off**

Create another scene named **HBS - Transition Overlay**. Add a **Browser** source named `HBS Transition Overlay` with:

- URL: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/transition-overlay.html`
- Width: `1920`
- Height: `1080`
- Shutdown source when not visible: **off**
- Refresh browser when scene becomes active: **off**

Keeping both browser sources loaded is important. It prevents a blank frame while OBS changes scenes.

Create a third reusable scene named **HBS - Music Audio**. Add a Browser source named `HBS Music Player` with:

- URL: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/music-player.html?output=1`
- Width: `1920`
- Height: `1080`
- Control audio via OBS: **on**
- Shutdown source when not visible: **off**
- Refresh browser when scene becomes active: **off**

The page is intentionally visually blank; it is the single audio player controlled by HBS. The `?output=1` part is required. Add **HBS - Music Audio** as a nested Scene source to every OBS scene across which music may continue. Reusing one source prevents a second copy of the stream from playing and allows the fade to continue while scenes change.

## 6. Build the tournament scene

Select `HBS - Tournament` and add these sources in this order (top to bottom):

1. **HBS - Global Rail** — choose **Add → Scene** and select the reusable rail scene.
2. **HBS - Transition Overlay** — choose **Add → Scene** and select the reusable transition scene.
3. **HBS Tournament Overlay** — add a Browser source using:
   `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/tournament.html`
4. Your gameplay capture, camera, or other video sources.

The tournament graphic is transparent around its information panels. Put live video sources below it. If you want a branded fallback behind the scene, add a Browser source using:

`http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/background.html`

Set every HBS Browser source to 1920×1080. Do not add `?background=1` to an OBS overlay source; that option is for an opaque browser preview, not for layering over live video.

## 7. Build the speedrun / gameplay scene

Select `HBS - Gameplay Show` and add these sources from top to bottom:

1. **HBS - Global Rail**
2. **HBS - Transition Overlay**
3. **HBS Speedrun Overlay** — Browser source URL:
   `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/speedrun.html`
4. Runner camera (optional)
5. Gameplay feed 1
6. Gameplay feed 2
7. Gameplay feed 3
8. Gameplay feed 4
9. **HBS - Feed Backgrounds** (optional fallback)
10. **HBS - Scene Background** (optional fallback)

The feed count selected in HBS determines which frames are visible. Add all four capture sources once, then use the visible labels to position them. Sources for unused feeds can remain hidden.

Add the two optional fallback Browser sources with:

- Feed backgrounds: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/feed-backgrounds.html`
- Scene background: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/background.html`

These are behind the captures. A working capture covers its placeholder; if a capture is missing, the branded background remains visible instead of a black box.

## 8. Add a second monitor or game capture

For a simple two-monitor test:

1. In the Sources dock, click **+ → Display Capture**.
2. Name it `Gameplay Feed 1`.
3. Select your second monitor in the **Display** field.
4. Click **OK**.
5. In HBS Setup / Preview, select **Speedrun / Gameplay**, choose **1** feed, and enable **Setup labels**.
6. Return to OBS and drag the display source into the `GAME 1` frame. Hold **Alt** while dragging an edge to crop it; drag normally to resize it.
7. Right-click the positioned source and choose **Lock**.
8. Repeat with **Game Capture**, **Window Capture**, or a capture-card source if those are more appropriate.
9. Turn **Setup labels** off before broadcast.

For consoles, split HDMI before capture so the player uses a low-latency display. Do not ask players to play from the OBS preview.

## 9. Add the runner camera

In HBS Setup / Preview, enable **Runner camera**, enter the runner name and pronouns, and click **Apply layout & info**. In OBS:

1. Choose **+ → Video Capture Device**.
2. Select the camera.
3. Resize it into the `RUNNER CAMERA` frame.
4. Keep it below `HBS Speedrun Overlay` and above the feed backgrounds.
5. Lock it after positioning.

Runner identity rails can remain visible even when the camera is disabled. Enable **Feed runner IDs** if each gameplay feed needs its own runner name, pronouns, and social handle.

## 10. Add lower thirds and the bottom rail

Create a Browser source in each program scene for the lower third, or add it as a reusable nested scene:

`http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/lower-third.html`

Keep it above video but below the transition overlay. In HBS Setup, enter the title/subtitle/tertiary text and click **Apply & show**. Use **Hide** when it should disappear.

The global rail is controlled from HBS Setup and Live Control. It can show:

- Donation total and goal
- Approved latest donor information
- Rotating sponsors and logos
- Announcements
- Now/up-next programming

Add sponsors and donation information in Setup, click **Apply rail content**, then use **Show rail**, **Safe blank**, or the module buttons in Live Control during the broadcast.

## 11. Build the interstitial scene

Select `HBS - Interstitial` and add these sources from top to bottom:

1. **HBS - Transition Overlay**
2. **HBS Interstitial** — Browser source URL:
   `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/interstitial.html`
3. **HBS - Music Audio**
4. An optional branded background if you want one behind the interstitial

Set `HBS Interstitial` to 1920×1080, keep both browser reload checkboxes off, and leave `HBS - Music Audio` visually behind the graphic. The interstitial includes the rotating event slide, upcoming programming, donation progress, sponsor rotation, and the current music title/artist at the bottom.

In **HBS Setup / Preview → Interstitial & music**:

1. Choose **Rainwave** or **Local folder**.
2. For Rainwave, choose a channel such as All, Game, OC ReMix, Covers, Chiptunes, or Chill. Public playback and now-playing metadata do not require an API key.
3. For local music, place audio in a subfolder under the project `music` folder, such as `music/hype` or `music/chill`, then click **Refresh folders & stations**. The filename format `Artist - Track Title.mp3` produces cleaner on-screen metadata.
4. Set the volume and fade time, then click **Apply music source**.
5. Add, remove, or edit the event slides and click **Apply interstitial**.
6. Open the **Interstitial** preview link to proof the layout. This preview shows metadata but does not play audio.

During the show, the operator uses **Start / fade in**, **Stop / fade out**, **Next track**, and the slide controls in Live Control. A safe change from a live feed is: start music, wait for the fade, then take **Interstitial**. To return live: stop music, wait for the fade, then take the live scene. Keep an eye on the `HBS Music Player` channel in the OBS Audio Mixer just as you would any other input.

## 12. Enable transitions

The simplest option is OBS **Fade**:

1. In OBS, locate the **Scene Transitions** dock.
2. Click the transition dropdown and choose **Fade**.
3. Set a duration such as **500 ms**.
4. In HBS Setup → Transitions, leave **OBS transition** selected and click **Apply transition settings**.

For a GDQ-style HBS wipe:

1. Make sure `HBS - Transition Overlay` is nested at the top of every program scene.
2. In HBS Setup → Transitions, select **HBS corner wipe**, **HBS diagonal wipe**, or **HBS iris**.
3. Set the total duration and click **Apply transition settings**.
4. Preview each style before going live.

HBS covers the screen, performs a hidden OBS scene cut at the midpoint, and reveals the destination scene. The overlay source must remain loaded. If it is missing, viewers may see the midpoint cut.

You can also create a video-based OBS Stinger from **Scene Transitions → + → Stinger**. After creating it, select its name in HBS Setup when OBS is connected.

## 13. Test before streaming

Use this order for a rehearsal:

1. Start HBS and OBS.
2. Confirm the dashboard says **OBS connected**.
3. Open the full browser proof: `http://127.0.0.1:9090/bundles/hurricon-broadcast/graphics/program-preview.html`.
4. In Setup, select Hurricon and confirm the background status names `backgrounds/hurricon-neon-grid.png`.
5. Apply a tournament layout and verify names, scores, socials, and the lower third.
6. Apply a one-to-four-feed speedrun layout and verify each capture, camera, timer, and runner rail.
7. Press **Show rail** and test donation, sponsor, announcement, and programming modules.
8. Configure Rainwave, start music, and confirm the title and artist change in the interstitial and the `HBS Music Player` meter moves in OBS.
9. Test a local playlist folder, Next track, and both fade directions.
10. Take every scene from Live Control and confirm OBS changes scenes.
11. Test the selected transition in both directions.
12. Start a local OBS recording and watch it back before starting the livestream.

The browser proof is useful for checking HBS data and layering, but it contains branded placeholders instead of real OBS captures. The OBS preview and a short recording are the final authority for video framing, audio, and transitions.

## Common problems

**OBS disconnected:** Confirm OBS is open, WebSocket is enabled on port 4455, the password matches `config/hurricon-broadcast.json`, and HBS was restarted after editing the file.

**`connect ECONNREFUSED 127.0.0.1:4455`:** OBS is not accepting connections. Open **Tools → WebSocket Server Settings**, check **Enable WebSocket server**, click **Apply** or **OK**, and restart HBS. If OBS and HBS are on different computers, replace `ws://127.0.0.1:4455` in the config with the OBS computer's private LAN address, such as `ws://10.6.62.34:4455`; keep both computers on the same trusted network and allow OBS through Windows Firewall. Never expose port 4455 to the public Internet.

**Password appeared in a screenshot or chat:** Treat it as compromised. Click **Generate Password** in OBS WebSocket settings, click **Apply**, replace the password in `config/hurricon-broadcast.json`, and restart HBS.

**Port 9090 already in use:** NodeCG is already running. Open the existing dashboard at `http://127.0.0.1:9090/dashboard/` instead of launching another copy. If it is stuck, find the process with `Get-NetTCPConnection -LocalPort 9090` and stop that specific PID.

**Browser source is black or stale:** Right-click the source → **Properties** → confirm the URL, width, and height. Ensure **Shutdown source when not visible** and **Refresh browser when scene becomes active** are off. Use **Refresh cache of current page** once during troubleshooting.

**Gameplay is hidden:** Move the capture source below the HBS overlay but above the feed background. Confirm the source eye is enabled and that it is not locked at an incorrect position or size.

**Background is missing:** In Setup, select the brand and click **Reload files**. Hurricon has an image background; Game Grove intentionally falls back to a CSS gradient until an image is added to its brand pack.

**Scene button does not switch OBS:** The scene name in OBS must exactly match the `sceneMap` name, including capitalization, spaces, and punctuation.

**Audio is delayed or doubled:** Monitor audio through one path only. Avoid monitoring the same microphone in both OBS and an external application unless you intentionally need both.

**Music metadata appears but there is no sound:** Confirm the Browser source URL ends in `?output=1`, **Control audio via OBS** is enabled, its mixer channel is not muted, and its volume fader is up. The ordinary interstitial preview deliberately does not output audio.

**Local playlist is empty:** Put supported audio files (`.mp3`, `.ogg`, `.wav`, `.flac`, `.m4a`, `.aac`, or `.opus`) inside a direct subfolder of `music`, then click **Refresh folders & stations**. Loose files directly inside `music` are not treated as a playlist.
