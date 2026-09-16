# Operator guide

## Pre-show checklist

- [ ] NodeCG running
- [ ] OBS connected and correct program scene shown
- [ ] Correct brand active
- [ ] Game capture and cameras visible
- [ ] Audio meters moving
- [ ] Tournament, break, technical, and lower-third graphics tested
- [ ] Speedrun/gameplay feed count, camera, timer, and source framing tested when used
- [ ] Global rail safe blank, rotation, donation values, sponsor logos, and next item tested
- [ ] Interstitial slides, music source, now-playing metadata, and fade controls tested
- [ ] Stream key/output configured
- [ ] Local recording enabled if required

## During the show

NodeCG now exposes two focused panels. **HBS Live Control** contains only frequent on-air actions: scene takes, scores, match status, the run timer, broadcast-rail transport, lower-third visibility, and program summaries. **HBS Setup / Preview** contains text entry, feed layouts, runner identities, donation/sponsor content, branding, transitions, and preview links. Prepare and proof content in Setup, then operate primarily from Live Control.

Each panel has a **Panel layout** bar. Choose **Reorganize**, then drag cards by their handles or use the arrow buttons for keyboard-friendly movement. Cards can also be collapsed. The arrangement saves automatically in that browser. **Save layout file** exports only card order and collapsed state; **Load layout file** transfers those preferences to another workstation. Live and Setup layouts are intentionally separate, and layout files contain no match data, sponsor content, credentials, or OBS configuration.

Use **Assets** in the NodeCG header to upload PNG, JPG, WEBP, GIF, or SVG files under **Broadcast Images**. Sponsor-logo and interstitial-slide image fields include **Select asset** buttons with thumbnail previews. The list updates after an upload without rebuilding HBS; select an image, then use the card's normal Apply button to put the change on air. Asset files live on the NodeCG server machine, so include the runtime `assets` folder in event backups.

Tournament player names retain the normal on-air type size. Names wider than their player card automatically use a slow, paused horizontal reveal so the complete tag is shown; names that already fit do not move. Reduced-motion systems show the full name as wrapped text instead.

Use **Open full Program Preview** in Setup / Preview to proof the entire 1920×1080 composition in an ordinary browser. It layers the active tournament, speedrun, interview, break, or technical layout with its scene/feed backgrounds, lower third, global rail, sponsor rotation, and transition overlay. The default URL follows the mode selected in Live Control; the fixed Tournament and Speedrun links are useful while preparing a scene that is not currently live. Capture inputs are represented by branded placeholders because only OBS can composite the real cameras and gameplay feeds.

Always operate Setup through `http://127.0.0.1:9090/dashboard/`. Opening the dashboard panel's HTML file directly is only a disconnected development fallback, so its fields use sample values and cannot change live NodeCG state.

Enter both players, game, round, and best-of value, then click **Apply match info**. Typing stays local until applied; score buttons remain immediate. **Swap players** moves all player metadata and scores. Reset scores has a confirmation. Set the match ready/live/complete as the bracket progresses.

Large Show Control buttons update NodeCG state and ask OBS to switch the configured scene. When OBS is disconnected, state still updates and the red status/error explains what did not switch. Use **Technical difficulties** as the safe-break action; it never stops streaming.

Choose the desired transition in **Setup / Preview** before the program. **OBS Fade** is a dependable default. A Stinger can provide a video-based branded wipe when one has been created in OBS; its timing is configured in OBS. HBS also provides asset-free **Corner**, **Diagonal**, and **Iris** transitions through the Transition Overlay Browser Source. Test every destination scene before broadcast.

Fill a lower third, choose its style, then Show/Hide it. Update **Now / up next** before going to break.

## Interstitial and music workflow

Configure the source in **Setup / Preview → Interstitial & music**. Rainwave supplies public game-music stations and live track information; Local reads playlist subfolders from the server machine's `music` directory. Set **Scene-change fade** to the desired fade time (0–10,000 ms). Leave **Automatically fade music...** checked to start/fade in when Interstitial is taken and stop/fade out when another scene is taken. Uncheck it for fully manual transport control. Click **Apply music source** after changing these settings. Click **Refresh folders & stations** after adding local files.

Slides rotate automatically when enabled and can contain a type label, headline, supporting text, and optional image. Apply edits before they are needed on air. During the show, use the compact Live Control buttons to start or stop music with a fade, advance a local track, or move the information slide manually.

With automatic scene fading enabled, taking **Interstitial** starts the music fade and taking gameplay, tournament, interview, or another destination starts the fade out. The manual Start and Stop buttons remain available for overrides. The audio comes from the dedicated `HBS Music Player` OBS Browser source; the visual preview does not play sound. Confirm the music meter in OBS before every take.

## Broadcast rail workflow

Use **Show rail** and **Safe blank** for immediate on-air visibility. **Previous** and **Next** take another enabled module immediately. **Hold rotation** pauses automatic movement without preventing manual module selection; press it again to resume. The four **Take module live** buttons are useful when a producer calls for a specific donation, sponsor, announcement, or upcoming segment.

Enter the fundraising total, goal, currency, and only donor details approved for broadcast. The tracker is intentionally usable without an Internet connection. Do not place donor email addresses, payment information, or unmoderated messages in the on-stream fields.

Add sponsors by display name and optionally an HTTPS or `/bundles/` logo URL. Disable a sponsor to retain its setup without placing it in rotation. Empty sponsor names are discarded when content is applied. Update **Now / up next** in Programming; the rail uses that same data rather than maintaining a second schedule.

Editing stays off-air until **Apply rail content** is pressed. **Safe blank** is the panic action: it hides the rail but preserves all content and rotation settings.

## Speedrun / gameplay workflow

Select **Speedrun / Gameplay** in Show Control. Choose one to four feeds, then enable or disable the runner camera and timer independently. Turn on **Setup labels** while arranging the corresponding OBS video sources, apply the layout and run information, then turn setup labels off before broadcast.

Enable **Feed runner IDs** to show a separate identification rail over each active gameplay feed. Enter each runner's name, pronouns, and optional social handle in its matching Feed 1–4 form. These rails are independent of the runner camera and remain visible when that camera is disabled. Enable **Rotate socials** to alternate each populated rail between name/pronouns and social; disable it to keep names and pronouns static.

The timer is optional. **Start** resumes from the displayed value, **Pause** freezes it, and **Reset** returns it to zero. Timer state is persistent across dashboard refreshes. Confirm a reset during production with the runner or event lead before pressing it.

Tournament player cards always show names and scores. Pronouns and location use separate lines, and a populated Social field rotates onto a second identity page automatically. Leave Social blank to keep pronouns/location static.

Typical source order, top to bottom, is: global rail, lower third, speedrun overlay, runner camera, game feeds, background. Lock the positioned video sources in OBS so routine dashboard operation cannot move them.

Signal path: `console → HDMI splitter → player display + capture device → OBS`; cameras feed capture devices; game and microphones feed the mixer/interface/OBS. Never make players compete through OBS preview latency.

## Brand background checks

After selecting a brand, the Brand settings card states either the configured scene-background file or that the brand uses its CSS gradient. Hurricon currently uses `backgrounds/hurricon-neon-grid.png`; Game Grove intentionally uses the gradient until an image is added to its brand pack. **Reload files** rereads the selected brand without requiring a rebuild. Refresh an already-open graphic if the browser has cached an older file.
