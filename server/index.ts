import { resolve } from 'node:path';
import type NodeCG from 'nodecg/types';
import { defaultMatch, defaultSpeedrun, speedrunFeedIdentities, timerAction } from '../src/domain';
import type { Brand, Commentator, LowerThirdState, MatchState, ObsState, ShowMode, ShowState, SpeedrunState } from '../src/types';
import { listBrandIds, loadBrand } from './branding';
import { ObsConnectionManager, type ObsConfig } from './obs/ObsConnectionManager';

type Config = { obs?: ObsConfig };

export = (nodecg: NodeCG.ServerAPI<Config>) => {
  const brandsRoot = resolve(__dirname, '../brands');
  const schemasRoot = resolve(__dirname, '../schemas');
  const match = nodecg.Replicant<MatchState>('match', { defaultValue: defaultMatch(), persistent: true });
  nodecg.Replicant<Commentator[]>('commentators', { defaultValue: [], persistent: true });
  nodecg.Replicant<LowerThirdState>('lowerThird', { defaultValue: { visible: false, title: '', style: 'person' }, persistent: true });
  const show = nodecg.Replicant<ShowState>('show', { defaultValue: { mode: 'tournament', nextSegment: 'More programming soon' }, persistent: true });
  const speedrun = nodecg.Replicant<SpeedrunState>('speedrun', { defaultValue: defaultSpeedrun(), persistent: true });
  if (!speedrun.value || ![1, 2, 3, 4].includes(speedrun.value.feedCount) || !speedrun.value.timer) {
    speedrun.value = defaultSpeedrun();
  }
  speedrun.value = {
    ...defaultSpeedrun(),
    ...speedrun.value,
    feedIdentitiesVisible: speedrun.value.feedIdentitiesVisible ?? true,
    feedSocialsVisible: speedrun.value.feedSocialsVisible ?? true,
    feedIdentities: speedrunFeedIdentities(speedrun.value)
  };
  const activeBrand = nodecg.Replicant<string>('activeBrand', { defaultValue: 'game-grove', persistent: true });
  const brand = nodecg.Replicant<Brand>('brand', { defaultValue: loadBrand(brandsRoot, schemasRoot, 'game-grove').brand, persistent: false });
  const brandStatus = nodecg.Replicant<{ available: string[]; warnings: string[]; error?: string }>('brandStatus', { defaultValue: { available: listBrandIds(brandsRoot), warnings: [] }, persistent: false });
  const obs = nodecg.Replicant<ObsState>('obs', { defaultValue: { connected: false, host: nodecg.bundleConfig.obs?.url ?? 'ws://127.0.0.1:4455' }, persistent: false });

  const applyBrand = (id: string): void => {
    try {
      const result = loadBrand(brandsRoot, schemasRoot, id);
      brand.value = result.brand;
      activeBrand.value = result.brand.id === 'template' ? id : result.brand.id;
      brandStatus.value = { available: listBrandIds(brandsRoot), warnings: result.warnings };
      nodecg.log.info(`Loaded brand ${result.brand.displayName}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      brandStatus.value = { available: listBrandIds(brandsRoot), warnings: [], error: message };
      nodecg.log.error(message);
    }
  };

  const controller = new ObsConnectionManager(nodecg.bundleConfig.obs ?? {}, (next) => { obs.value = { ...obs.value, ...next }; }, nodecg.log);
  void controller.start();
  nodecg.listenFor('brand:set', (id) => { if (typeof id === 'string') applyBrand(id); });
  nodecg.listenFor('brand:reload', () => applyBrand(activeBrand.value));
  nodecg.listenFor('show:setMode', async (mode) => {
    if (typeof mode !== 'string') return;
    show.value = { ...show.value, mode: mode as ShowMode };
    try { await controller.switchScene(mode as ShowMode); }
    catch (error) { obs.value = { ...obs.value, lastError: error instanceof Error ? error.message : String(error) }; }
  });
  nodecg.listenFor('obs:setTransition', async (data) => {
    if (!data || typeof data !== 'object') return;
    const value = data as { name?: string; durationMs?: number };
    if (typeof value.name !== 'string') return;
    try { await controller.setTransition({ name: value.name, durationMs: typeof value.durationMs === 'number' ? value.durationMs : undefined }); }
    catch (error) { obs.value = { ...obs.value, lastError: error instanceof Error ? error.message : String(error) }; }
  });
  nodecg.listenFor('match:swap', () => { match.value = { ...match.value, player1: match.value.player2, player2: match.value.player1 }; });
  nodecg.listenFor('match:score', (data) => {
    if (!data || typeof data !== 'object') return;
    const value = data as { side?: 'player1'|'player2'; delta?: number };
    if ((value.side !== 'player1' && value.side !== 'player2') || typeof value.delta !== 'number') return;
    match.value = { ...match.value, [value.side]: { ...match.value[value.side], score: Math.max(0, match.value[value.side].score + value.delta) } };
  });
  nodecg.listenFor('speedrun:timer', (action) => {
    if (action !== 'start' && action !== 'pause' && action !== 'reset') return;
    speedrun.value = { ...speedrun.value, timer: timerAction(speedrun.value.timer, action) };
  });
};
