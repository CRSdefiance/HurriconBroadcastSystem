$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..\_reference'
New-Item -ItemType Directory -Force -Path $root | Out-Null
$repos = @{
  'agdq19-layouts' = 'https://github.com/GamesDoneQuick/agdq19-layouts.git'
  'gdq-break-channels' = 'https://github.com/GamesDoneQuick/gdq-break-channels.git'
  'gdq-viewport-assign' = 'https://github.com/GamesDoneQuick/gdq-viewport-assign.git'
  'nodecg' = 'https://github.com/nodecg/nodecg.git'
}
foreach ($name in $repos.Keys) {
  $path = Join-Path $root $name
  if (Test-Path (Join-Path $path '.git')) { git -C $path pull --ff-only }
  elseif ($name -eq 'nodecg') { git clone --depth 1 --branch nodecg-v2.8.0 $repos[$name] $path }
  else { git clone --depth 1 $repos[$name] $path }
}

