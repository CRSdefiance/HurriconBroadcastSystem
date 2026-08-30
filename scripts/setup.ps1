$ErrorActionPreference = 'Stop'
$nodeVersion = node --version
if ($nodeVersion -notmatch '^v(22|24)\.') { Write-Warning "HBS supports Node.js 22 or 24; found $nodeVersion." }
npm install
npm run build
Write-Host 'Ready. Run npm run dev, then open http://127.0.0.1:9090.'
