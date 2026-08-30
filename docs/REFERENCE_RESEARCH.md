# Reference research

Inspected 2026-08-28. Repositories live under ignored `_reference/` and can be refreshed with either fetch script.

| Reference | Commit | License | Useful ideas | Copied code |
|---|---|---|---|---|
| [agdq19-layouts](https://github.com/GamesDoneQuick/agdq19-layouts) | `99b44aac1bca99482bfb149a88f7ffff9eed164f` | Apache-2.0 | Historical NodeCG separation of dashboards, graphics, schemas, shared state, and server work | None |
| [gdq-break-channels](https://github.com/GamesDoneQuick/gdq-break-channels) | `d8652e1821f3804eb9e1233745bfccf6a0a5f7e3` | Apache-2.0 | Modern TypeScript/Vite modular break-channel composition and reusable presentation modules | None |
| [gdq-viewport-assign](https://github.com/GamesDoneQuick/gdq-viewport-assign) | `e71062a4e375b41934084be023884b128f4c6700` | Unspecified; no LICENSE found | Logical feed/viewport workflow, assignment UI concepts, current OBS v5 expectations | None; architecture-only reference |
| [NodeCG](https://github.com/nodecg/nodecg) | `29d70b39f514d1649b27c8d0ca2281f07b63e7bd` (`nodecg-v2.8.0`) | MIT | Current runtime, bundle manifest, Replicants, server extensions | APIs used; no source copied |
| [obs-websocket](https://github.com/obsproject/obs-websocket) | Current protocol documentation inspected online | GPL-2.0 | v5 protocol, port 4455, authenticated connection, program scene requests/events | None; accessed through MIT client library |

NodeCG's release feed identifies 2.8.0 as current on the inspection date; its installation guide still instructs Node.js 22. OBS documentation confirms WebSocket is built into OBS 28+, protocol v5 normally listens on port 4455, and authentication should remain enabled. All HBS source and visual assets are original.

