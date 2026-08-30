#!/usr/bin/env sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)/_reference"
mkdir -p "$ROOT"
fetch() { name="$1"; url="$2"; shift 2; if [ -d "$ROOT/$name/.git" ]; then git -C "$ROOT/$name" pull --ff-only; else git clone --depth 1 "$@" "$url" "$ROOT/$name"; fi; }
fetch agdq19-layouts https://github.com/GamesDoneQuick/agdq19-layouts.git
fetch gdq-break-channels https://github.com/GamesDoneQuick/gdq-break-channels.git
fetch gdq-viewport-assign https://github.com/GamesDoneQuick/gdq-viewport-assign.git
fetch nodecg https://github.com/nodecg/nodecg.git --branch nodecg-v2.8.0

