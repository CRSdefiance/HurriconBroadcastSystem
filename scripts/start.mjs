import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
mkdirSync(resolve(root, 'bundles'), { recursive: true });
console.log('Hurricon Broadcast System');
console.log('NodeCG dashboard: http://127.0.0.1:9090');
console.log('OBS connection: waiting...');
const child = spawn(process.execPath, [resolve(root, 'node_modules/nodecg/index.js')], { cwd: root, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 0; });
