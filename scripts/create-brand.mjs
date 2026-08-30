import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const displayName = process.argv.slice(2).join(' ').trim();
if (!displayName) { console.error('Usage: npm run brand:new -- "My Event"'); process.exit(1); }
const id = displayName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (!id) { console.error('The event name must contain a letter or number.'); process.exit(1); }
const root = resolve(import.meta.dirname, '..');
const target = resolve(root, 'brands', id);
if (existsSync(target)) { console.error(`Brand already exists: ${id}`); process.exit(1); }
cpSync(resolve(root, 'brands/_template'), target, { recursive: true });
const file = resolve(target, 'brand.json');
const brand = JSON.parse(readFileSync(file, 'utf8'));
brand.id = id; brand.displayName = displayName; brand.shortName = displayName;
writeFileSync(file, JSON.stringify(brand, null, 2) + '\n');
console.log(`Created brands/${id}`);
console.log(`1. Replace brands/${id}/assets/logo-primary.svg`);
console.log(`2. Replace brands/${id}/assets/logo-mark.svg`);
console.log(`3. Edit brands/${id}/brand.json`);
console.log(`4. Select “${displayName}” in the HBS Settings dashboard`);

