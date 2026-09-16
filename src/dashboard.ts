import './styles/dashboard.css';
import './styles/transition-dashboard.css';
import './styles/interstitial-dashboard.css';
import { applyBrand } from './brand';
import { mockBrand, mockBroadcastRail, mockLowerThird, mockMatch, mockObs, mockShow, mockSpeedrun, mockTransitionOverlay, mockTransitionSettings } from './mock';
import { observe } from './replicant';
import { speedrunFeedIdentities, timerAction, timerElapsed } from './domain';
import { advanceBroadcastRail, normalizeBroadcastRail } from './rail';
import { normalizeTransitionSettings } from './transition';
import { socialPlatforms } from './social';
import { defaultInterstitial, defaultMusic, normalizeInterstitial, normalizeMusic, rainwaveStations } from './interstitial';
import { normalizePanelLayoutPreferences, type DashboardPanel, type PanelLayoutPreferences } from './layout-preferences';
import type { Brand, BroadcastRailState, FeedCount, FeedIdentity, HbsTransitionMode, InterstitialSlide, InterstitialState, LowerThirdState, MatchState, MusicLibraryState, MusicSource, MusicState, ObsState, RailModule, ShowMode, ShowState, SocialPlatform, SpeedrunState, SponsorItem, TransitionOverlayState, TransitionSettings } from './types';

const $ = <T extends HTMLElement>(selector:string) => document.querySelector<T>(selector);
const all = <T extends HTMLElement>(selector:string) => [...document.querySelectorAll<T>(selector)];
const toast = (message:string) => { const el=$<HTMLElement>('[data-toast]');if(!el)return;el.textContent=message;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),2200); };
const value = (selector:string) => ($<HTMLInputElement|HTMLSelectElement>(selector)?.value ?? '').trim();
const setText = (selector:string,content:unknown) => {const element=$(selector);if(element)element.textContent=content==null?'':String(content);};
const renderSocialPlatformOptions = () => all<HTMLSelectElement>('[data-social-platform]').forEach((select) => {
  const selected = select.value || 'twitch';
  select.innerHTML = socialPlatforms.map((platform) => `<option value="${platform.value}">${platform.label}</option>`).join('');
  select.value = selected;
});
renderSocialPlatformOptions();

// Keep navigation between the two HBS panels live in both dashboard and
// standalone contexts. NodeCG injects its API only when standalone=true is
// retained on a detached panel URL.
all<HTMLAnchorElement>('a[href="setup.html"],a[href="index.html"]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  const target = link.getAttribute('href')!;
  const standalone = new URLSearchParams(window.location.search).has('standalone');
  window.location.assign(standalone ? `${target}?standalone=true` : target);
}));

const matchRep=observe<MatchState>('match',mockMatch,(m)=>{all<HTMLInputElement>('[data-field]').forEach((el)=>{if(document.activeElement!==el)el.value=String(m[el.dataset.field as 'game'|'round'|'bestOf']??'')});(['player1','player2'] as const).forEach((side,i)=>{all<HTMLInputElement>(`[data-p${i+1}]`).forEach((el)=>{if(document.activeElement!==el)el.value=String(m[side][el.dataset[`p${i+1}`] as keyof typeof m[typeof side]]??'')});const out=$<HTMLOutputElement>(`[data-score-value="${side}"]`);if(out)out.value=String(m[side].score);setText(`[data-live-player="${side}"]`,m[side].displayName)});});
const lowerRep=observe<LowerThirdState>('lowerThird',mockLowerThird,(lower)=>{all<HTMLInputElement|HTMLSelectElement>('[data-lower]').forEach((el)=>{if(document.activeElement!==el)el.value=String(lower[el.dataset.lower as keyof LowerThirdState]??'')});setText('[data-live-lower-title]',lower.title||'Nothing queued');setText('[data-live-lower-subtitle]',lower.subtitle);});
const showRep=observe<ShowState>('show',mockShow,(show)=>{all<HTMLInputElement>('[data-show]').forEach((el)=>{if(document.activeElement!==el)el.value=String(show[el.dataset.show as keyof ShowState]??'')});all<HTMLButtonElement>('[data-mode]').forEach((button)=>button.classList.toggle('active',button.dataset.mode===show.mode));setText('[data-live-show="current"]',show.currentSegment||'Live show');setText('[data-live-show="next"]',show.nextSegment||'More programming soon');setText('[data-live-show="time"]',show.nextSegmentTime);});
let railState = mockBroadcastRail;
let sponsorDraft: SponsorItem[] = [];
const renderSponsorEditors = (sponsors: SponsorItem[]) => {
  sponsorDraft = sponsors.map((sponsor) => ({ ...sponsor }));
  const box = $('[data-sponsor-editors]');
  if (!box || box.contains(document.activeElement)) return;
  box.innerHTML = sponsorDraft.map((_, index) => `<article class="sponsor-editor" data-sponsor-editor="${index}"><div class="sponsor-editor-head"><h3>Sponsor ${index + 1}</h3><button type="button" data-remove-sponsor="${index}" class="danger">Remove</button></div><label class="check"><input type="checkbox" data-sponsor-field="enabled"> Include in rotation</label><label>Display name<input maxlength="120" data-sponsor-field="name"></label><label>Logo URL / bundle path<input maxlength="500" data-sponsor-field="logoUrl" placeholder="https://… or /bundles/…"></label></article>`).join('');
  all<HTMLElement>('[data-sponsor-editor]').forEach((panel) => {
    const sponsor = sponsorDraft[Number(panel.dataset.sponsorEditor)];
    const name = panel.querySelector<HTMLInputElement>('[data-sponsor-field="name"]');
    const logo = panel.querySelector<HTMLInputElement>('[data-sponsor-field="logoUrl"]');
    const enabled = panel.querySelector<HTMLInputElement>('[data-sponsor-field="enabled"]');
    if (name) name.value = sponsor?.name ?? '';
    if (logo) logo.value = sponsor?.logoUrl ?? '';
    if (enabled) enabled.checked = sponsor?.enabled !== false;
  });
  all<HTMLButtonElement>('[data-remove-sponsor]').forEach((button) => button.addEventListener('click', () => { sponsorDraft.splice(Number(button.dataset.removeSponsor), 1); button.blur(); renderSponsorEditors(sponsorDraft); }));
};
const railRep=observe<BroadcastRailState>('broadcastRail',mockBroadcastRail,(rail)=>{
  railState=normalizeBroadcastRail(rail);
  all<HTMLInputElement>('[data-rail]').forEach((el)=>{const key=el.dataset.rail as 'automatic'|'rotationSeconds';if(el.type==='checkbox')el.checked=Boolean(railState[key]);else if(document.activeElement!==el)el.value=String(railState[key])});
  all<HTMLInputElement>('[data-rail-module-enabled]').forEach((el)=>{el.checked=railState.enabledModules[el.dataset.railModuleEnabled as RailModule]});
  all<HTMLInputElement>('[data-donation]').forEach((el)=>{if(document.activeElement!==el)el.value=String(railState.donation[el.dataset.donation as keyof typeof railState.donation]??'')});
  const announcement=$<HTMLTextAreaElement>('[data-rail-announcement]');if(announcement&&document.activeElement!==announcement)announcement.value=railState.announcement;
  const visibility=$('[data-rail-visibility]');if(visibility)visibility.textContent=railState.visible?'On air':'Hidden';
  const current=$('[data-rail-current]');if(current)current.textContent=`${railState.activeModule}${railState.held?' · held':''}`;
  all<HTMLButtonElement>('[data-rail-module]').forEach((button)=>button.classList.toggle('active',button.dataset.railModule===railState.activeModule));
  const hold=$<HTMLButtonElement>('[data-rail-action="toggleHold"]');if(hold)hold.textContent=railState.held?'Resume rotation':'Hold rotation';
  renderSponsorEditors(railState.sponsors);
});
let speedrunState = mockSpeedrun;
const renderDashboardTimer=()=>{const elapsed=timerElapsed(speedrunState.timer);const hours=Math.floor(elapsed/3_600_000);const minutes=Math.floor(elapsed/60_000)%60;const seconds=Math.floor(elapsed/1000)%60;const tenths=Math.floor(elapsed/100)%10;const out=$<HTMLOutputElement>('[data-speedrun-timer]');if(out)out.value=`${hours?`${String(hours).padStart(2,'0')}:`:''}${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${tenths}`;};
const speedrunRep=observe<SpeedrunState>('speedrun',mockSpeedrun,(run)=>{speedrunState=run;const identities=speedrunFeedIdentities(run);all<HTMLInputElement>('[data-speedrun]').forEach((el)=>{if(document.activeElement!==el)el.value=String(run[el.dataset.speedrun as keyof SpeedrunState]??'')});all<HTMLInputElement>('[data-speedrun-toggle]').forEach((el)=>{el.checked=Boolean(run[el.dataset.speedrunToggle as keyof SpeedrunState])});all<HTMLInputElement>('[data-feed-identity]').forEach((el)=>{if(document.activeElement===el)return;const [position,field]=el.dataset.feedIdentity!.split(':') as [string,keyof FeedIdentity];el.value=String(identities[Number(position)-1]?.[field]??'')});all<HTMLElement>('[data-feed-identity-panel]').forEach((panel)=>{panel.hidden=Number(panel.dataset.feedIdentityPanel)>run.feedCount});all<HTMLButtonElement>('[data-feed-count]').forEach((button)=>button.classList.toggle('active',Number(button.dataset.feedCount)===run.feedCount));setText('[data-live-speedrun="game"]',run.game);setText('[data-live-speedrun="runner"]',run.runner);setText('[data-live-speedrun="layout"]',`${run.feedCount} ${run.feedCount===1?'feed':'feeds'}${run.cameraVisible?' · camera':''}${run.timerVisible?' · timer':''}`);renderDashboardTimer();});
window.setInterval(renderDashboardTimer,100);
let transitionSettingsState=mockTransitionSettings;
observe<ObsState>('obs',mockObs,(obs)=>{const pill=$<HTMLElement>('[data-obs-pill]');pill?.classList.toggle('connected',obs.connected);const status=$('[data-obs-status]');if(status)status.textContent=obs.connected?'OBS connected':'OBS disconnected';const scene=$('[data-obs-scene]');if(scene)scene.textContent=obs.currentProgramScene??obs.host??'';const transition=$<HTMLSelectElement>('[data-obs-transition]');if(transition&&document.activeElement!==transition){const names=obs.availableTransitions?.length?obs.availableTransitions:['Fade','Cut'];transition.innerHTML=names.map((name)=>`<option value="${name}">${name}</option>`).join('');transition.value=names.includes(transitionSettingsState.obsName)?transitionSettingsState.obsName:(obs.currentTransition&&names.includes(obs.currentTransition)?obs.currentTransition:names[0]);}const error=$('[data-obs-error]');if(error)error.textContent=obs.lastError??'';});
const transitionSettingsRep=observe<TransitionSettings>('transitionSettings',mockTransitionSettings,(raw)=>{const settings=normalizeTransitionSettings(raw);transitionSettingsState=settings;const mode=$<HTMLSelectElement>('[data-transition-mode]');if(mode&&document.activeElement!==mode)mode.value=settings.mode;const transition=$<HTMLSelectElement>('[data-obs-transition]');if(transition&&document.activeElement!==transition)transition.value=settings.obsName;const duration=$<HTMLInputElement>('[data-obs-transition-duration]');if(duration&&document.activeElement!==duration)duration.value=String(settings.durationMs);});
observe<TransitionOverlayState>('transitionOverlay',mockTransitionOverlay,(state)=>{const busy=state.phase==='covering'||state.phase==='revealing';all<HTMLButtonElement>('[data-mode]').forEach((button)=>button.disabled=busy);setText('[data-transition-live-status]',busy?`${state.style} transition · ${state.phase}`:state.error?`Transition recovered: ${state.error}`:'');});
const brandRep=observe<Brand>('brand',mockBrand,(brand)=>{applyBrand(brand);const box=$('[data-swatches]');if(box)box.innerHTML=['primary','secondary','accent','background','panel'].map((key)=>`<i title="${key}" style="background:${brand.colors[key]}"></i>`).join('');setText('[data-brand-background]',brand.assets.background?`Scene background: ${brand.assets.background}`:'Scene background: CSS brand gradient (no image configured)');});
observe<{available:string[];warnings:string[];error?:string}>('brandStatus',{available:['game-grove','hurricon'],warnings:[]},(status)=>{const select=$<HTMLSelectElement>('[data-brand-select]');if(select){const selected=select.value;select.innerHTML=status.available.map((id)=>`<option value="${id}">${id}</option>`).join('');if(status.available.includes(selected))select.value=selected;}const message=$('[data-brand-message]');if(message)message.textContent=status.error??status.warnings.join(' · ');});
const activeBrandRep=observe<string>('activeBrand','game-grove',(id)=>{const select=$<HTMLSelectElement>('[data-brand-select]');if(select)select.value=id;});

all<HTMLButtonElement>('[data-score]').forEach((button)=>button.addEventListener('click',()=>{const [side,delta]=button.dataset.score!.split(':') as ['player1'|'player2',string];if(window.nodecg)void window.nodecg.sendMessage('match:score',{side,delta:Number(delta)});else{const m=matchRep.get();matchRep.set({...m,[side]:{...m[side],score:Math.max(0,m[side].score+Number(delta))}})}}));
$('[data-action="swap"]')?.addEventListener('click',()=>{if(window.nodecg)void window.nodecg.sendMessage('match:swap');else{const m=matchRep.get();matchRep.set({...m,player1:m.player2,player2:m.player1})}});
$('[data-action="reset"]')?.addEventListener('click',()=>{if(!confirm('Reset both scores to zero?'))return;const m=matchRep.get();matchRep.set({...m,player1:{...m.player1,score:0},player2:{...m.player2,score:0}});toast('Scores reset');});
$('[data-action="apply"]')?.addEventListener('click',()=>{const current=matchRep.get();const readPlayer=(side:'player1'|'player2',number:1|2)=>({...current[side],displayName:value(`[data-p${number}="displayName"]`),pronouns:value(`[data-p${number}="pronouns"]`),location:value(`[data-p${number}="location"]`),social:value(`[data-p${number}="social"]`),seed:Number(value(`[data-p${number}="seed"]`))||null});matchRep.set({...current,game:value('[data-field="game"]'),round:value('[data-field="round"]'),bestOf:Number(value('[data-field="bestOf"]'))||null,player1:readPlayer('player1',1),player2:readPlayer('player2',2)});toast('Match info applied');});
all<HTMLButtonElement>('[data-status]').forEach((button)=>button.addEventListener('click',()=>matchRep.set({...matchRep.get(),status:button.dataset.status as MatchState['status']})));
all<HTMLButtonElement>('[data-mode]').forEach((button)=>button.addEventListener('click',()=>{const mode=button.dataset.mode as ShowMode;if(window.nodecg)void window.nodecg.sendMessage('show:setMode',mode);else showRep.set({...showRep.get(),mode});}));
$('[data-action="apply-transition"]')?.addEventListener('click',()=>{const mode=value('[data-transition-mode]') as HbsTransitionMode;const obsName=value('[data-obs-transition]')||'Fade';const durationMs=Number(value('[data-obs-transition-duration]'))||700;const settings=normalizeTransitionSettings({mode,obsName,durationMs});if(window.nodecg)void window.nodecg.sendMessage('transition:set',settings);toast(settings.mode==='obs'?`OBS transition set to ${settings.obsName}`:`HBS ${settings.mode} wipe enabled`);});
all<HTMLButtonElement>('[data-feed-count]').forEach((button)=>button.addEventListener('click',()=>speedrunRep.set({...speedrunRep.get(),feedCount:Number(button.dataset.feedCount) as FeedCount})));
all<HTMLButtonElement>('[data-timer-action]').forEach((button)=>button.addEventListener('click',()=>{const action=button.dataset.timerAction as 'start'|'pause'|'reset';if(action==='reset'&&!confirm('Reset the run timer to zero?'))return;if(window.nodecg)void window.nodecg.sendMessage('speedrun:timer',action);else speedrunRep.set({...speedrunRep.get(),timer:timerAction(speedrunRep.get().timer,action)});}));
$('[data-action="apply-speedrun"]')?.addEventListener('click',()=>{const current=speedrunRep.get();const checked=(name:string)=>$<HTMLInputElement>(`[data-speedrun-toggle="${name}"]`)?.checked??false;const feedIdentities:FeedIdentity[]=Array.from({length:4},(_,index)=>({name:value(`[data-feed-identity="${index+1}:name"]`),pronouns:value(`[data-feed-identity="${index+1}:pronouns"]`),social:value(`[data-feed-identity="${index+1}:social"]`)}));speedrunRep.set({...current,cameraVisible:checked('cameraVisible'),timerVisible:checked('timerVisible'),guidesVisible:checked('guidesVisible'),feedIdentitiesVisible:checked('feedIdentitiesVisible'),feedSocialsVisible:checked('feedSocialsVisible'),feedIdentities,game:value('[data-speedrun="game"]'),platform:value('[data-speedrun="platform"]'),runner:value('[data-speedrun="runner"]'),pronouns:value('[data-speedrun="pronouns"]'),category:value('[data-speedrun="category"]'),estimate:value('[data-speedrun="estimate"]')});toast('Speedrun layout applied');});
all<HTMLButtonElement>('[data-lower-action]').forEach((button)=>button.addEventListener('click',()=>{const current=lowerRep.get();const field=(selector:string,fallback:string|undefined)=>$(selector)?value(selector):fallback;lowerRep.set({...current,visible:button.dataset.lowerAction==='show',title:field('[data-lower="title"]',current.title)??'',subtitle:field('[data-lower="subtitle"]',current.subtitle),tertiary:field('[data-lower="tertiary"]',current.tertiary),style:($( '[data-lower="style"]')?value('[data-lower="style"]'):current.style) as LowerThirdState['style']});}));
$('[data-action="apply-show"]')?.addEventListener('click',()=>{showRep.set({...showRep.get(),currentSegment:value('[data-show="currentSegment"]'),nextSegment:value('[data-show="nextSegment"]'),nextSegmentTime:value('[data-show="nextSegmentTime"]')});toast('Programming updated');});
$('[data-action="add-sponsor"]')?.addEventListener('click',()=>{if(sponsorDraft.length>=12){toast('Sponsor limit is 12');return;}sponsorDraft.push({id:`sponsor-${Date.now()}`,name:'',enabled:true});renderSponsorEditors(sponsorDraft);});
$('[data-action="apply-rail"]')?.addEventListener('click',()=>{
  const sponsors=all<HTMLElement>('[data-sponsor-editor]').map((panel,index)=>({id:sponsorDraft[index]?.id||`sponsor-${index+1}`,name:(panel.querySelector<HTMLInputElement>('[data-sponsor-field="name"]')?.value??'').trim(),logoUrl:(panel.querySelector<HTMLInputElement>('[data-sponsor-field="logoUrl"]')?.value??'').trim()||undefined,enabled:panel.querySelector<HTMLInputElement>('[data-sponsor-field="enabled"]')?.checked??true})).filter((sponsor)=>sponsor.name);
  const donation={total:Number(value('[data-donation="total"]'))||0,goal:Number(value('[data-donation="goal"]'))||0,currency:value('[data-donation="currency"]')||'USD',latestDonor:value('[data-donation="latestDonor"]')||undefined,latestAmount:Number(value('[data-donation="latestAmount"]'))||undefined,latestMessage:value('[data-donation="latestMessage"]')||undefined,updatedAt:Date.now()};
  const enabledModules=Object.fromEntries((['donation','sponsor','announcement','programming'] as RailModule[]).map((module)=>[module,$<HTMLInputElement>(`[data-rail-module-enabled="${module}"]`)?.checked??false])) as Record<RailModule,boolean>;
  const next=normalizeBroadcastRail({...railState,automatic:$<HTMLInputElement>('[data-rail="automatic"]')?.checked??true,rotationSeconds:Number(value('[data-rail="rotationSeconds"]'))||12,enabledModules,donation,announcement:value('[data-rail-announcement]'),sponsors,updatedAt:Date.now()});
  if(window.nodecg)void window.nodecg.sendMessage('rail:update',next);else railRep.set(next);toast('Broadcast rail content applied');
});
all<HTMLButtonElement>('[data-rail-action]').forEach((button)=>button.addEventListener('click',()=>{const action=button.dataset.railAction!;if(window.nodecg)void window.nodecg.sendMessage('rail:control',action);else if(action==='next'||action==='previous')railRep.set(advanceBroadcastRail(railState,action==='next'?1:-1));else railRep.set({...railState,visible:action==='show'?true:action==='hide'?false:railState.visible,held:action==='toggleHold'?!railState.held:railState.held,updatedAt:Date.now()});}));
all<HTMLButtonElement>('[data-rail-module]').forEach((button)=>button.addEventListener('click',()=>{const module=button.dataset.railModule as RailModule;if(window.nodecg)void window.nodecg.sendMessage('rail:setModule',module);else railRep.set({...railState,visible:true,activeModule:module,updatedAt:Date.now()});}));
$('[data-action="set-brand"]')?.addEventListener('click',()=>{const id=value('[data-brand-select]');if(window.nodecg)void window.nodecg.sendMessage('brand:set',id);toast(`Selected ${id}`);});
$('[data-action="reload-brand"]')?.addEventListener('click',()=>{if(window.nodecg)void window.nodecg.sendMessage('brand:reload');toast('Brand files reloaded');});
type HbsPreset = { version: 1; name: string; savedAt: string; match: MatchState; speedrun: SpeedrunState; broadcastRail: BroadcastRailState; lowerThird: LowerThirdState; show: ShowState; transitionSettings: TransitionSettings; interstitial?: InterstitialState; music?: MusicState; activeBrand: string };
const presetCard = document.createElement('section');
presetCard.className = 'card preset-card';
presetCard.innerHTML = '<span class="eyebrow">Configuration library</span><h2>Save / load setup</h2><p class="hint">Save match data, layouts, runner identities, rail sponsors, interstitial slides, music selection, lower thirds, programming, transitions, and the active brand as a reusable JSON preset. Playback always loads stopped.</p><div class="two"><label>Preset name<input data-preset-name maxlength="80" placeholder="Default tournament"></label><div class="actions"><button data-preset-save class="primary">Save to file</button><button data-preset-load>Load from file</button><input data-preset-file type="file" accept="application/json,.json" hidden></div></div><p class="message" data-preset-message></p>';
if ($('[data-brand-select]')) $('main.dashboard')?.append(presetCard);
const presetMessage = (message:string) => { const el = presetCard.querySelector<HTMLElement>('[data-preset-message]'); if (el) el.textContent = message; };
const currentPreset = (): HbsPreset => ({version:1,name:(presetCard.querySelector<HTMLInputElement>('[data-preset-name]')?.value||'HBS preset').trim(),savedAt:new Date().toISOString(),match:matchRep.get(),speedrun:speedrunRep.get(),broadcastRail:railRep.get(),lowerThird:lowerRep.get(),show:showRep.get(),transitionSettings:transitionSettingsRep.get(),interstitial:interstitialRep.get(),music:{...musicRep.get(),playing:false,status:'stopped',error:undefined},activeBrand:activeBrandRep.get()});
const isObject = (value:unknown): value is Record<string,unknown> => Boolean(value) && typeof value === 'object';
const applyPreset = (value:unknown) => {
  if (!isObject(value) || value.version !== 1 || !isObject(value.match) || !isObject(value.speedrun) || !isObject(value.broadcastRail) || !isObject(value.lowerThird) || !isObject(value.show) || !isObject(value.transitionSettings) || typeof value.activeBrand !== 'string') throw new Error('This is not a valid HBS preset file.');
  matchRep.set(value.match as unknown as MatchState); speedrunRep.set(value.speedrun as unknown as SpeedrunState); railRep.set(normalizeBroadcastRail(value.broadcastRail as unknown as Partial<BroadcastRailState>)); lowerRep.set(value.lowerThird as unknown as LowerThirdState); showRep.set(value.show as unknown as ShowState); transitionSettingsRep.set(normalizeTransitionSettings(value.transitionSettings as unknown as Partial<TransitionSettings>)); if (isObject(value.interstitial)) interstitialRep.set(normalizeInterstitial(value.interstitial as unknown as Partial<InterstitialState>)); if (isObject(value.music)) { const loadedMusic=normalizeMusic({...value.music,playing:false,status:'stopped'} as unknown as Partial<MusicState>); if(window.nodecg)void window.nodecg.sendMessage('music:configure',loadedMusic);else musicRep.set(loadedMusic); }
  if (window.nodecg) void window.nodecg.sendMessage('brand:set', value.activeBrand); else activeBrandRep.set(value.activeBrand);
  const name = typeof value.name === 'string' ? value.name : 'preset'; const field = presetCard.querySelector<HTMLInputElement>('[data-preset-name]'); if (field) field.value = name; presetMessage(`Loaded ${name}. Click Apply buttons only if you want to edit it further.`);
};
presetCard.querySelector('[data-preset-save]')?.addEventListener('click',()=>{const preset=currentPreset();const blob=new Blob([JSON.stringify(preset,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${preset.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'hbs-preset'}.json`;link.click();URL.revokeObjectURL(link.href);presetMessage(`Saved ${preset.name}.`);});
const presetFile=presetCard.querySelector<HTMLInputElement>('[data-preset-file]');presetCard.querySelector('[data-preset-load]')?.addEventListener('click',()=>presetFile?.click());presetFile?.addEventListener('change',async()=>{const file=presetFile.files?.[0];if(!file)return;try{applyPreset(JSON.parse(await file.text()));}catch(error){presetMessage(error instanceof Error?error.message:'Could not load preset.');}finally{presetFile.value='';}});
// Platform pickers keep operator entry compact: choose the service once, then
// type only the channel name that should appear beside its recognizable logo.
const installSocialControls = () => all<HTMLInputElement>('[data-p1="social"],[data-p2="social"],[data-feed-identity$=":social"]').forEach((input) => {
  if (input.parentElement?.parentElement?.querySelector('[data-social-platform]')) return;
  const player = input.getAttribute('data-p1') === 'social' ? 'p1' : input.getAttribute('data-p2') === 'social' ? 'p2' : undefined;
  const feed = input.dataset.feedIdentity?.split(':')[0];
  const select = document.createElement('select');
  select.dataset.socialPlatform = '';
  if (player) select.setAttribute(`data-${player}`, 'socialPlatform');
  if (feed) select.dataset.feedSocialPlatform = feed;
  select.innerHTML = socialPlatforms.map((platform) => `<option value="${platform.value}">${platform.label}</option>`).join('');
  const platformLabel = document.createElement('label'); platformLabel.textContent = 'Platform'; platformLabel.append(select);
  input.placeholder = 'name, not a full link';
  const handleLabel = input.parentElement; if (handleLabel?.firstChild) handleLabel.firstChild.textContent = 'Handle / username';
  handleLabel?.before(platformLabel);
});
installSocialControls();
observe<MatchState>('match', mockMatch, (match) => (['player1','player2'] as const).forEach((side, index) => {
  const select = $<HTMLSelectElement>(`[data-p${index + 1}="socialPlatform"]`); if (select && document.activeElement !== select) select.value = match[side].socialPlatform ?? 'twitch';
}));
observe<SpeedrunState>('speedrun', mockSpeedrun, (run) => speedrunFeedIdentities(run).forEach((identity, index) => {
  const select = $<HTMLSelectElement>(`[data-feed-social-platform="${index + 1}"]`); if (select && document.activeElement !== select) select.value = identity.socialPlatform ?? 'twitch';
}));
document.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.dataset.action === 'apply') queueMicrotask(() => {
    const match = matchRep.get();
    matchRep.set({ ...match, player1: { ...match.player1, socialPlatform: (value('[data-p1="socialPlatform"]') || 'twitch') as SocialPlatform }, player2: { ...match.player2, socialPlatform: (value('[data-p2="socialPlatform"]') || 'twitch') as SocialPlatform } });
  });
  if (button.dataset.action === 'apply-speedrun') queueMicrotask(() => {
    const run = speedrunRep.get(); const identities = speedrunFeedIdentities(run).map((identity, index) => ({ ...identity, socialPlatform: (value(`[data-feed-social-platform="${index + 1}"]`) || 'twitch') as SocialPlatform }));
    speedrunRep.set({ ...run, feedIdentities: identities });
  });
});
// Interstitial and music controls are composed here so embedded and standalone
// panels receive the same operator-focused interface.
const sceneGrid = $('.scene-grid');
if (sceneGrid && !sceneGrid.querySelector('[data-mode="interstitial"]')) {
  const button = document.createElement('button'); button.dataset.mode = 'interstitial'; button.textContent = 'Interstitial';
  sceneGrid.insertBefore(button, sceneGrid.querySelector('[data-mode="technical"]'));
  button.addEventListener('click', () => { if (window.nodecg) void window.nodecg.sendMessage('show:setMode', 'interstitial'); else showRep.set({ ...showRep.get(), mode: 'interstitial' }); });
}

const liveMusicCard = document.createElement('section');
liveMusicCard.className = 'card music-live-card';
liveMusicCard.innerHTML = '<div class="section-head"><div><span class="eyebrow">Interstitial audio</span><h2>Music transport</h2></div><div class="rail-live-status"><span data-live-music-source>Music</span><strong data-live-music-status>Stopped</strong></div></div><div class="music-summary"><div><strong data-live-music-title>Nothing playing</strong><span data-live-music-detail></span></div><small data-live-music-error></small></div><div class="music-control-grid"><button class="music-play" data-music-action="play">Start / fade in</button><button class="danger" data-music-action="stop">Stop / fade out</button><button data-music-action="next">Next track</button><button data-music-action="refresh">Refresh library</button></div><div class="interstitial-transport"><button data-interstitial-action="previous">Previous slide</button><button data-interstitial-action="next">Next slide</button></div>';
if (sceneGrid) sceneGrid.closest('.card')?.after(liveMusicCard);

const setupInterstitialCard = document.createElement('section');
setupInterstitialCard.className = 'card interstitial-setup-card';
setupInterstitialCard.innerHTML = '<span class="eyebrow">Between-show programming</span><h2>Interstitial &amp; music</h2><p class="hint">Configure Rainwave or server-local playlist folders, fade behavior, and the rotating information shown while gameplay is off screen.</p><div class="three"><label>Music source<select data-music-setting="source"><option value="rainwave">Rainwave</option><option value="local">Local folder</option></select></label><label data-rainwave-setting>Rainwave channel<select data-music-setting="rainwaveStation"></select></label><label data-local-setting>Playlist folder<select data-music-setting="localFolder"></select></label></div><div class="two"><label>Volume (0–100)<input data-music-setting="volume" type="number" min="0" max="100" step="1"></label><label>Scene-change fade (ms)<input data-music-setting="fadeMs" type="number" min="0" max="10000" step="100"></label></div><label class="check"><input type="checkbox" data-music-setting="autoWithInterstitial"> Automatically fade music in when taking Interstitial and out when leaving</label><div class="actions"><button data-action="refresh-music">Refresh folders &amp; stations</button><button class="primary" data-action="apply-music">Apply music source</button></div><p class="message" data-music-setup-message></p><hr><div class="section-head"><div><span class="eyebrow">Interstitial rotation</span><h3>Slides</h3></div><button data-action="add-interstitial-slide">Add slide</button></div><div class="two"><label class="check"><input type="checkbox" data-interstitial-setting="automatic"> Automatic rotation</label><label>Seconds per slide<input data-interstitial-setting="rotationSeconds" type="number" min="3" max="300"></label></div><div class="interstitial-slide-grid" data-interstitial-slides></div><div class="actions"><button class="primary" data-action="apply-interstitial">Apply interstitial</button></div><p class="hint">Images may use HTTPS URLs or bundle paths. Leave the image blank for a branded text slide.</p>';
if ($('[data-brand-select]')) $('main.dashboard')?.append(setupInterstitialCard);
const previewLinks = $('.preview-links');
if (previewLinks) { const interstitialLink = document.createElement('a'); interstitialLink.href = '../graphics/interstitial.html?background=1'; interstitialLink.target = '_blank'; interstitialLink.textContent = 'Interstitial'; previewLinks.append(interstitialLink); }

let interstitialDraft: InterstitialSlide[] = [];
const renderInterstitialEditors = (slides: InterstitialSlide[]) => {
  interstitialDraft = slides.map((slide) => ({ ...slide })); const box = $('[data-interstitial-slides]');
  if (!box || box.contains(document.activeElement)) return;
  box.innerHTML = interstitialDraft.map((_, index) => `<article class="interstitial-slide-editor" data-interstitial-slide="${index}"><div class="interstitial-slide-head"><h3>Slide ${index + 1}</h3><button class="danger" data-remove-interstitial-slide="${index}">Remove</button></div><label class="check"><input type="checkbox" data-slide-field="enabled"> Include in rotation</label><label>Eyebrow / type<input data-slide-field="kicker" maxlength="100"></label><label>Headline<input data-slide-field="title" maxlength="180"></label><label>Body<textarea data-slide-field="body" maxlength="500" rows="3"></textarea></label><label>Image URL / bundle path<input data-slide-field="imageUrl" maxlength="1000" placeholder="https://… or /bundles/…"></label></article>`).join('');
  all<HTMLElement>('[data-interstitial-slide]').forEach((panel) => { const slide = interstitialDraft[Number(panel.dataset.interstitialSlide)]; panel.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('[data-slide-field]').forEach((field) => { const key = field.dataset.slideField as keyof InterstitialSlide; if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = slide?.enabled !== false; else field.value = String(slide?.[key] ?? ''); }); });
};

let musicState = defaultMusic();
const musicRep = observe<MusicState>('music', defaultMusic(), (raw) => {
  musicState = normalizeMusic(raw); all<HTMLInputElement|HTMLSelectElement>('[data-music-setting]').forEach((field) => { if (document.activeElement === field) return; const key = field.dataset.musicSetting as keyof MusicState; if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = Boolean(musicState[key]); else field.value = key === 'volume' ? String(Math.round(musicState.volume * 100)) : String(musicState[key] ?? ''); });
  setText('[data-live-music-source]', musicState.source === 'rainwave' ? `Rainwave · ${musicState.rainwaveStation}` : `Local · ${musicState.localFolder}`); setText('[data-live-music-status]', musicState.playing ? musicState.status : 'stopped'); setText('[data-live-music-title]', musicState.trackTitle || 'Nothing playing'); setText('[data-live-music-detail]', [musicState.artist,musicState.album].filter(Boolean).join(' · ')); setText('[data-live-music-error]', musicState.error); setText('[data-music-setup-message]', musicState.error);
});
observe<MusicLibraryState>('musicLibrary', { folders: [], stations: rainwaveStations }, (library) => {
  const station = $<HTMLSelectElement>('[data-music-setting="rainwaveStation"]'); if (station) { station.innerHTML = (library.stations.length ? library.stations : rainwaveStations).map((item) => `<option value="${item.key}">${item.name}</option>`).join(''); station.value = musicState.rainwaveStation; }
  const folder = $<HTMLSelectElement>('[data-music-setting="localFolder"]'); if (folder) { folder.innerHTML = library.folders.map((name) => `<option value="${name}">${name}</option>`).join('') || '<option value="">No playlist folders found</option>'; folder.value = musicState.localFolder; }
});
let interstitialState = defaultInterstitial();
const interstitialRep = observe<InterstitialState>('interstitial', defaultInterstitial(), (raw) => { interstitialState = normalizeInterstitial(raw); const automatic = $<HTMLInputElement>('[data-interstitial-setting="automatic"]'); if (automatic) automatic.checked = interstitialState.automatic; const seconds = $<HTMLInputElement>('[data-interstitial-setting="rotationSeconds"]'); if (seconds && document.activeElement !== seconds) seconds.value = String(interstitialState.rotationSeconds); renderInterstitialEditors(interstitialState.slides); });
const updateMusicVisibility = () => { const source = value('[data-music-setting="source"]') as MusicSource; const rainwave = $('[data-rainwave-setting]'); const local = $('[data-local-setting]'); if (rainwave) rainwave.hidden = source === 'local'; if (local) local.hidden = source !== 'local'; };
$('[data-music-setting="source"]')?.addEventListener('change', updateMusicVisibility); updateMusicVisibility();
all<HTMLButtonElement>('[data-music-action]').forEach((button) => button.addEventListener('click', () => { const action = button.dataset.musicAction; if (window.nodecg) void window.nodecg.sendMessage('music:control', action); else musicRep.set({ ...musicState, playing: action === 'play' ? true : action === 'stop' ? false : musicState.playing, updatedAt: Date.now() }); }));
$('[data-action="refresh-music"]')?.addEventListener('click', () => { if (window.nodecg) void window.nodecg.sendMessage('music:control', 'refresh'); toast('Music library refreshed'); });
$('[data-action="apply-music"]')?.addEventListener('click', () => { const next: Partial<MusicState> = { source: value('[data-music-setting="source"]') as MusicSource, rainwaveStation: value('[data-music-setting="rainwaveStation"]'), localFolder: value('[data-music-setting="localFolder"]'), volume: (Number(value('[data-music-setting="volume"]')) || 0) / 100, fadeMs: Number(value('[data-music-setting="fadeMs"]')) || 0, autoWithInterstitial: $<HTMLInputElement>('[data-music-setting="autoWithInterstitial"]')?.checked ?? true }; if (window.nodecg) void window.nodecg.sendMessage('music:configure', next); else musicRep.set(normalizeMusic({ ...musicState, ...next })); toast('Music source applied'); });
all<HTMLButtonElement>('[data-interstitial-action]').forEach((button) => button.addEventListener('click', () => { if (window.nodecg) void window.nodecg.sendMessage('interstitial:control', button.dataset.interstitialAction); }));
$('[data-action="add-interstitial-slide"]')?.addEventListener('click', () => { if (interstitialDraft.length >= 24) return toast('Slide limit is 24'); interstitialDraft.push({ id: `slide-${Date.now()}`, enabled: true, title: 'New event message' }); renderInterstitialEditors(interstitialDraft); });
document.addEventListener('click', (event) => { const remove = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-remove-interstitial-slide]'); if (!remove) return; interstitialDraft.splice(Number(remove.dataset.removeInterstitialSlide), 1); renderInterstitialEditors(interstitialDraft); });
$('[data-action="apply-interstitial"]')?.addEventListener('click', () => { const slides = all<HTMLElement>('[data-interstitial-slide]').map((panel, index) => { const field = (name:string) => (panel.querySelector<HTMLInputElement|HTMLTextAreaElement>(`[data-slide-field="${name}"]`)?.value ?? '').trim(); return { id: interstitialDraft[index]?.id || `slide-${index + 1}`, enabled: panel.querySelector<HTMLInputElement>('[data-slide-field="enabled"]')?.checked ?? true, kicker: field('kicker'), title: field('title'), body: field('body'), imageUrl: field('imageUrl') || undefined }; }).filter((slide) => slide.title); const next = normalizeInterstitial({ ...interstitialState, automatic: $<HTMLInputElement>('[data-interstitial-setting="automatic"]')?.checked ?? true, rotationSeconds: Number(value('[data-interstitial-setting="rotationSeconds"]')) || 12, slides, updatedAt: Date.now() }); if (window.nodecg) void window.nodecg.sendMessage('interstitial:update', next); else interstitialRep.set(next); toast('Interstitial applied'); });

// Operator layout preferences are browser-local by default and can be moved
// between workstations with a small JSON file. Only presentation order and
// collapsed state are included; no match, sponsor, or credential data leaves.
const installLayoutEditor = () => {
  const dashboard = document.querySelector<HTMLElement>('main.dashboard');
  if (!dashboard) return;
  const panel: DashboardPanel = dashboard.classList.contains('live-dashboard') ? 'live' : 'setup';
  const storageKey = `hbs-panel-layout-v1:${panel}`;
  const cards = () => Array.from(dashboard.querySelectorAll<HTMLElement>(':scope > .card'));
  const idFor = (card: HTMLElement, index: number) => {
    if (card.dataset.layoutId) return card.dataset.layoutId;
    const label = [card.querySelector('.eyebrow')?.textContent, card.querySelector('h2')?.textContent].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    card.dataset.layoutId = label || `panel-${index + 1}`;
    return card.dataset.layoutId;
  };
  cards().forEach(idFor);
  const knownIds = () => cards().map((card, index) => idFor(card, index));
  const current = (): PanelLayoutPreferences => ({ version: 1, panel, order: knownIds(), collapsed: cards().filter((card) => card.classList.contains('layout-collapsed')).map((card, index) => idFor(card, index)) });
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(current())); } catch { toast('This browser could not save the panel layout'); } };
  const apply = (preferences: PanelLayoutPreferences) => {
    const byId = new Map(cards().map((card, index) => [idFor(card, index), card]));
    preferences.order.forEach((id) => { const card = byId.get(id); if (card) dashboard.append(card); });
    cards().forEach((card, index) => card.classList.toggle('layout-collapsed', preferences.collapsed.includes(idFor(card, index))));
  };
  try { const saved = localStorage.getItem(storageKey); if (saved) { const normalized = normalizePanelLayoutPreferences(JSON.parse(saved), panel, knownIds()); if (normalized) apply(normalized); } } catch { localStorage.removeItem(storageKey); }

  const toolbar = document.createElement('aside');
  toolbar.className = 'layout-toolbar';
  toolbar.innerHTML = `<div><strong>Panel layout</strong><span>Saved automatically on this browser</span></div><div class="layout-toolbar-actions"><button data-layout-edit>Reorganize</button><button data-layout-export>Save layout file</button><button data-layout-import>Load layout file</button><button data-layout-reset>Reset</button><input data-layout-file type="file" accept="application/json,.json" hidden></div>`;
  dashboard.before(toolbar);
  let editing = false;
  let dragged: HTMLElement | null = null;
  const setEditing = (next: boolean) => {
    editing = next; dashboard.classList.toggle('layout-editing', editing);
    toolbar.querySelector<HTMLButtonElement>('[data-layout-edit]')!.textContent = editing ? 'Done reorganizing' : 'Reorganize';
    cards().forEach((card) => { card.draggable = false; });
  };
  const move = (card: HTMLElement, direction: -1 | 1) => {
    const siblings = cards(); const index = siblings.indexOf(card); const destination = siblings[index + direction];
    if (!destination) return;
    if (direction < 0) dashboard.insertBefore(card, destination); else dashboard.insertBefore(destination, card);
    persist(); card.querySelector<HTMLButtonElement>('.layout-drag-handle')?.focus();
  };
  cards().forEach((card) => {
    const controls = document.createElement('div'); controls.className = 'layout-card-tools';
    controls.innerHTML = '<button class="layout-drag-handle" draggable="true" title="Drag to reposition" aria-label="Drag panel to reposition">⠿ Drag</button><button data-layout-up title="Move up" aria-label="Move panel up">↑</button><button data-layout-down title="Move down" aria-label="Move panel down">↓</button><button data-layout-collapse>Collapse</button>';
    card.prepend(controls);
    const handle = controls.querySelector<HTMLButtonElement>('.layout-drag-handle')!;
    handle.addEventListener('dragstart', (event) => { if (!editing) { event.preventDefault(); return; } dragged = card; card.classList.add('layout-dragging'); event.dataTransfer?.setData('text/plain', card.dataset.layoutId || 'panel'); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'; });
    handle.addEventListener('dragend', () => { dragged = null; card.classList.remove('layout-dragging'); cards().forEach((item) => item.classList.remove('layout-drop-target')); persist(); });
    card.addEventListener('dragover', (event) => { if (!editing || !dragged || dragged === card) return; event.preventDefault(); card.classList.add('layout-drop-target'); const after = event.clientY > card.getBoundingClientRect().top + card.offsetHeight / 2; dashboard.insertBefore(dragged, after ? card.nextSibling : card); });
    card.addEventListener('dragleave', () => card.classList.remove('layout-drop-target'));
    controls.querySelector('[data-layout-up]')?.addEventListener('click', () => move(card, -1));
    controls.querySelector('[data-layout-down]')?.addEventListener('click', () => move(card, 1));
    controls.querySelector<HTMLButtonElement>('[data-layout-collapse]')?.addEventListener('click', (event) => { card.classList.toggle('layout-collapsed'); (event.currentTarget as HTMLButtonElement).textContent = card.classList.contains('layout-collapsed') ? 'Expand' : 'Collapse'; persist(); });
  });
  cards().forEach((card) => { const button = card.querySelector<HTMLButtonElement>('[data-layout-collapse]'); if (button) button.textContent = card.classList.contains('layout-collapsed') ? 'Expand' : 'Collapse'; });
  toolbar.querySelector('[data-layout-edit]')?.addEventListener('click', () => setEditing(!editing));
  toolbar.querySelector('[data-layout-export]')?.addEventListener('click', () => { const blob = new Blob([JSON.stringify(current(), null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `hbs-${panel}-panel-layout.json`; link.click(); URL.revokeObjectURL(link.href); toast('Panel layout saved to file'); });
  const file = toolbar.querySelector<HTMLInputElement>('[data-layout-file]')!;
  toolbar.querySelector('[data-layout-import]')?.addEventListener('click', () => file.click());
  file.addEventListener('change', async () => { const selected = file.files?.[0]; if (!selected) return; try { const normalized = normalizePanelLayoutPreferences(JSON.parse(await selected.text()), panel, knownIds()); if (!normalized) throw new Error(`This is not an HBS ${panel} panel layout file.`); apply(normalized); persist(); cards().forEach((card) => { const button = card.querySelector<HTMLButtonElement>('[data-layout-collapse]'); if (button) button.textContent = card.classList.contains('layout-collapsed') ? 'Expand' : 'Collapse'; }); toast('Panel layout loaded'); } catch (error) { toast(error instanceof Error ? error.message : 'Could not load layout'); } finally { file.value = ''; } });
  toolbar.querySelector('[data-layout-reset]')?.addEventListener('click', () => { localStorage.removeItem(storageKey); location.reload(); });
};
installLayoutEditor();
