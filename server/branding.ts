import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { Brand } from '../src/types';

export interface BrandResult { brand: Brand; warnings: string[] }

export function safeAssetPath(brandRoot: string, relativePath: string): string | null {
  const resolvedRoot = resolve(brandRoot) + sep;
  const candidate = resolve(brandRoot, relativePath);
  return candidate.startsWith(resolvedRoot) ? candidate : null;
}

export function listBrandIds(brandsRoot: string): string[] {
  return readdirSync(brandsRoot, { withFileTypes: true }).filter((item) => item.isDirectory() && item.name !== '_template').map((item) => item.name).sort();
}

export function loadBrand(brandsRoot: string, schemasRoot: string, requestedId: string): BrandResult {
  const fallbackId = '_template';
  const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedId) ? requestedId : fallbackId;
  const warnings: string[] = [];
  let folder = resolve(brandsRoot, safeId);
  if (!existsSync(resolve(folder, 'brand.json'))) { warnings.push(`Brand “${requestedId}” was not found; using the template.`); folder = resolve(brandsRoot, fallbackId); }
  const value: unknown = JSON.parse(readFileSync(resolve(folder, 'brand.json'), 'utf8'));
  const schema = JSON.parse(readFileSync(resolve(schemasRoot, 'brand.json'), 'utf8')) as object;
  const ajv = new Ajv({ allErrors: true, strict: false }); addFormats(ajv);
  if (!ajv.validate(schema, value)) throw new Error(`Invalid brand.json: ${ajv.errorsText()}`);
  const brand = value as Brand;
  for (const [label, relativePath] of Object.entries(brand.assets)) {
    const path = safeAssetPath(folder, relativePath);
    if (!path || !existsSync(path)) warnings.push(`Missing ${label} asset: ${relativePath}`);
  }
  return { brand, warnings };
}
