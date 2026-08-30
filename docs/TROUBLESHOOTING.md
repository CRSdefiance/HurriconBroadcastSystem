# Troubleshooting

- **Dashboard opens, graphics do not:** run `npm run build`, confirm the graphic URL is under `/bundles/hurricon-broadcast/graphics/`, and refresh the browser source cache.
- **OBS does not connect:** enable its WebSocket server/authentication, verify port 4455 and the ignored config password, and check Windows Firewall on a LAN setup.
- **Wrong scene names:** make OBS scene names exactly match `sceneMap` in the config.
- **Scene still cuts:** choose Fade or a Stinger in HBS Control, confirm its name appears in OBS's Scene Transitions dock, and remove any conflicting per-scene transition override in OBS.
- **Stinger duration does not change:** fixed-duration Stingers use their transition point and timing from OBS; the HBS duration field applies only to configurable transitions such as Fade.
- **HBS wipe cuts visibly:** add the same **HBS - Transition Overlay** nested scene above every program scene, keep its Browser Source loaded, and verify the URL ends in `transition-overlay.html`.
- **Program stays covered during a wipe:** use Live Control again only after the transition status clears; confirm OBS WebSocket is connected. HBS automatically reveals after switch errors, but refreshing the Transition Overlay Browser Source also returns it to transparent idle state.
- **Logo missing:** inspect the Brand settings warning, filename/case, and asset path. Reload files after a rebuild.
- **White/black browser background:** enable browser-source transparency and place capture beneath the overlay; HBS pages themselves are transparent.
- **Score not updating:** confirm both dashboard and graphic are connected to the same NodeCG instance; refresh either page safely because Replicants persist.
- **Sponsor not appearing:** the V0.1 rotation UI is not complete; the break page intentionally shows a placeholder.
- **Capture source black:** confirm the device is unused by another app, HDCP is not present, input resolution matches, and the console goes through a proper splitter to the player display.
- **OBS restarted:** wait for the status pill to turn green; HBS retries every three seconds. Re-select the intended show scene if necessary.
- **NodeCG restarted:** reopen the dashboard/graphics. Persistent match/show data returns from NodeCG storage.
