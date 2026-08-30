# Windows quickstart

1. Install Node.js 24 and OBS Studio. Node.js 22 remains supported if it is already installed.
2. Open PowerShell in this folder and run `scripts/setup.ps1`.
3. Copy `config/hurricon-broadcast.example.json` to `config/hurricon-broadcast.json` and enter the OBS WebSocket password.
4. Run `npm run dev` (or double-click `scripts/start-hbs.cmd` after setup).
5. Open `http://127.0.0.1:9090`, then open **HBS Control**.
6. Use its preview links to confirm every graphic before adding the same URLs as OBS Browser Sources at 1920×1080.

The controls and graphics communicate locally through NodeCG. Internet access is not required after installation. Use `npm run preview` for mock browser pages during design work; the complete synchronized control path uses `npm run dev`.
