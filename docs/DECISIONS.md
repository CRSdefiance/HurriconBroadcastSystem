# Decisions

## 2026-08-28 — Current upstream baseline

Pin NodeCG 2.8.0 and support Node.js 22 (the upstream documented runtime) plus Node.js 24. Node 24.19.0 was verified locally through install, typecheck, build, tests, NodeCG startup, extension mounting, HTTP routes, and browser rendering. Use obs-websocket protocol v5 via `obs-websocket-js`, defaulting to authenticated `ws://127.0.0.1:4455`.

## 2026-08-28 — Vertical slice before framework

Use strict, framework-free TypeScript and CSS for the first bundle. The screens are state-driven but small enough that React would add setup and dependency cost without improving the initial operator workflow. Vite builds all HTML entries, and NodeCG Replicants remain the source of truth.

## 2026-08-28 — Runtime layout

Keep source in neutral `pages/` and `server/` folders and emit an ignored installable bundle into `bundles/hurricon-broadcast`. This prevents dependency-mode NodeCG from mistaking source folders for an installed bundle while preserving the conventional runtime path and requiring no global CLI or junctions.

## 2026-08-28 — Original assets and clean-room concepts

Ship original geometric placeholder marks only. No upstream graphics or implementation code was copied. Viewport math is a clean-room implementation of standard contain/cover geometry; the unlicensed viewport repository remains read-only reference material.
