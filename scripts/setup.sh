#!/usr/bin/env sh
set -eu
NODE_VERSION="$(node --version)"
case "$NODE_VERSION" in v22.*|v24.*) ;; *) printf '%s\n' "Warning: HBS supports Node.js 22 or 24; found $NODE_VERSION." >&2 ;; esac
npm install
npm run build
printf '%s\n' 'Ready. Run npm run dev, then open http://127.0.0.1:9090.'
