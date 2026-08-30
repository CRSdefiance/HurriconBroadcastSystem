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
- [ ] Stream key/output configured
- [ ] Local recording enabled if required

## During the show

Enter both players, game, round, and best-of value, then click **Apply match info**. Typing stays local until applied; score buttons remain immediate. **Swap players** moves all player metadata and scores. Reset scores has a confirmation. Set the match ready/live/complete as the bracket progresses.

Large Show Control buttons update NodeCG state and ask OBS to switch the configured scene. When OBS is disconnected, state still updates and the red status/error explains what did not switch. Use **Technical difficulties** as the safe-break action; it never stops streaming.

Choose the desired OBS transition and duration in Show Control before the program. **Fade** at 400–600 ms is a dependable default. A Stinger can provide a branded wipe when one has been created in OBS; its timing is configured in OBS and HBS ignores the duration field. Test every destination scene because transitions apply to whole OBS scene changes, not to manually hiding or showing sources inside one scene.

Fill a lower third, choose its style, then Show/Hide it. Update **Now / up next** before going to break.

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
