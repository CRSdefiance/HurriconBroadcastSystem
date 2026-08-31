import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadBrand, safeAssetPath } from '../server/branding';
const root=resolve(import.meta.dirname,'..');
describe('brand loading',()=>{
  it('validates the shipped Game Grove brand',()=>expect(loadBrand(resolve(root,'brands'),resolve(root,'schemas'),'game-grove').brand.id).toBe('game-grove'));
  it('ships a valid Hurricon scene and feed background',()=>{const result=loadBrand(resolve(root,'brands'),resolve(root,'schemas'),'hurricon');expect(result.warnings).toEqual([]);expect(result.brand.assets.background).toBe('backgrounds/hurricon-neon-grid.png');expect(result.brand.assets.feedBackground).toBe(result.brand.assets.background);});
  it('falls back safely when a brand is absent',()=>expect(loadBrand(resolve(root,'brands'),resolve(root,'schemas'),'missing').warnings[0]).toMatch(/not found/));
  it('blocks directory traversal',()=>expect(safeAssetPath(resolve(root,'brands/game-grove'),'../hurricon/brand.json')).toBeNull());
});
