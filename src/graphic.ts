import './styles/graphics.css';
import './styles/identity-transitions.css';
import { applyBrand, assetUrl } from './brand';
import { mockBrand, mockBroadcastRail, mockCommentators, mockLowerThird, mockMatch, mockShow, mockSpeedrun, mockTransitionOverlay } from './mock';
import { observe } from './replicant';
import { speedrunFeedIdentities, timerElapsed } from './domain';
import { normalizeBroadcastRail } from './rail';
import { normalizeTransitionOverlay } from './transition';
import type { Brand, BroadcastRailState, Commentator, FeedCount, HbsTransitionMode, LowerThirdState, MatchState, PlayerState, ShowState, SpeedrunState, TransitionOverlayState } from './types';

const $ = <T extends HTMLElement>(selector: string): T | null => document.querySelector(selector);
const text = (selector: string, value: unknown) => { const el = $(selector); if (el) el.textContent = value == null ? '' : String(value); };
const layout = document.body.dataset.layout;
const previewParams = new URLSearchParams(location.search);
const compositePreview = previewParams.get('background') === '1' && layout !== 'background' && layout !== 'speedrun-backgrounds';
document.body.classList.toggle('composite-preview', compositePreview);
const fit = () => { const stage = $('.stage'); if (stage) (stage as HTMLElement).style.transform = `scale(${Math.min(innerWidth/1920, innerHeight/1080)})`; };
addEventListener('resize', fit); fit();

observe<Brand>('brand', mockBrand, (value) => {
  applyBrand(value);
  document.documentElement.classList.toggle('reduce-motion', value.animation.reducedMotion);
  document.querySelectorAll<HTMLImageElement>('[data-logo]').forEach((img) => {
    img.src = assetUrl(value, value.assets.logoPrimary);
    img.onerror = () => { img.src = assetUrl(value, value.assets.logoMark); };
  });
  const sceneBackground = value.assets.background;
  const feedBackground = value.assets.feedBackground ?? sceneBackground;
  const slotBackground = (slot?: string) => {
    const override = slot === 'runner' ? value.assets.runnerBackground : value.assets[`feed${slot}Background`];
    return override ?? feedBackground;
  };
  document.querySelectorAll<HTMLElement>('[data-scene-background]').forEach((element) => {
    element.style.backgroundImage = sceneBackground ? `url("${assetUrl(value, sceneBackground)}")` : '';
  });
  document.querySelectorAll<HTMLElement>('[data-feed-background]').forEach((element) => {
    const selectedBackground = slotBackground(element.dataset.feedBackground);
    element.style.backgroundImage = selectedBackground ? `url("${assetUrl(value, selectedBackground)}")` : '';
  });
  if (compositePreview) {
    const sceneTarget = layout === 'break' || layout === 'technical' ? $('.stage > .background') : $('.stage');
    if (sceneTarget) sceneTarget.style.backgroundImage = sceneBackground ? `url("${assetUrl(value, sceneBackground)}")` : '';
    const feedTargets: Array<[string, string]> = [
      ['.tournament .game-hole', '1'],
      ['.show .main-feed', '1'],
      ['.show .secondary', '2'],
      ['.speedrun .feed-1', '1'],
      ['.speedrun .feed-2', '2'],
      ['.speedrun .feed-3', '3'],
      ['.speedrun .feed-4', '4'],
      ['.speedrun .camera-window', 'runner']
    ];
    for (const [selector, slot] of feedTargets) {
      const selectedBackground = slotBackground(slot);
      const viewport = $(selector);
      if (viewport) viewport.style.backgroundImage = selectedBackground ? `url("${assetUrl(value, selectedBackground)}")` : '';
    }
  }
});
const renderPlayerIdentity = (side: 'p1'|'p2', player: PlayerState) => {
  text(`[data-${side}-name]`, player.displayName);
  text(`[data-${side}-pronouns]`, player.pronouns);
  text(`[data-${side}-location]`, player.location);
  text(`[data-${side}-social]`, player.social);
  $(`.tournament .${side}`)?.classList.toggle('has-social', Boolean(player.social));
};
observe<MatchState>('match', mockMatch, (m) => { text('[data-game]',m.game);text('[data-round]',m.round);text('[data-status]',m.status);renderPlayerIdentity('p1',m.player1);renderPlayerIdentity('p2',m.player2);text('[data-p1-score]',m.player1.score);text('[data-p2-score]',m.player2.score);text('[data-best]',m.bestOf ? `BEST OF ${m.bestOf}` : ''); });
observe<Commentator[]>('commentators', mockCommentators, (list) => text('[data-commentators]',list.length ? `Commentary: ${list.map((c)=>c.name).join(' · ')}` : ''));
observe<ShowState>('show', mockShow, (s) => { text('[data-current]',s.currentSegment || (layout === 'break' ? 'Intermission' : 'Live show'));text('[data-next]',s.nextSegment || 'More programming soon');text('[data-next-time]',s.nextSegmentTime || ''); });
observe<LowerThirdState>('lowerThird', mockLowerThird, (lower) => { const card = $('[data-lower-card]'); card?.classList.toggle('visible', lower.visible);text('[data-lower-title]',lower.title);text('[data-lower-subtitle]',lower.subtitle);text('[data-lower-tertiary]',lower.tertiary); });
const money = (amount: number, currency: string) => { try { return new Intl.NumberFormat('en-US',{style:'currency',currency:currency||'USD',maximumFractionDigits:amount%1?2:0}).format(amount); } catch { return `${currency||'$'} ${amount.toLocaleString()}`; } };
const safeSponsorLogo = (url?: string) => url && (url.startsWith('https://') || url.startsWith('/bundles/')) ? url : '';
observe<BroadcastRailState>('broadcastRail', mockBroadcastRail, (raw) => {
  if (layout !== 'broadcast-rail') return;
  const rail=normalizeBroadcastRail(raw);const root=$('[data-broadcast-rail]');root?.classList.toggle('visible',rail.visible);
  document.querySelectorAll<HTMLElement>('[data-rail-page]').forEach((page)=>{const active=page.dataset.railPage===rail.activeModule;page.classList.toggle('active',active);page.setAttribute('aria-hidden',String(!active));});
  text('[data-donation-total]',money(rail.donation.total,rail.donation.currency));text('[data-donation-goal]',rail.donation.goal>0?`of ${money(rail.donation.goal,rail.donation.currency)} goal`:'raised');
  const percent=rail.donation.goal>0?Math.min(100,rail.donation.total/rail.donation.goal*100):0;const donationProgress=$<HTMLElement>('[data-donation-progress]');if(donationProgress)donationProgress.style.width=`${percent}%`;
  text('[data-latest-donor]',rail.donation.latestDonor?`${rail.donation.latestDonor}${rail.donation.latestAmount?` · ${money(rail.donation.latestAmount,rail.donation.currency)}`:''}`:'');text('[data-latest-message]',rail.donation.latestMessage);
  const latest=$('[data-latest-donation]');latest?.classList.toggle('hidden',!rail.donation.latestDonor&&!rail.donation.latestMessage);
  const enabledSponsors=rail.sponsors.filter((sponsor)=>sponsor.enabled);const sponsor=enabledSponsors.length?enabledSponsors[rail.sponsorIndex%enabledSponsors.length]:undefined;text('[data-sponsor-name]',sponsor?.name);
  const sponsorLogo=$<HTMLImageElement>('[data-sponsor-logo]');if(sponsorLogo){const url=safeSponsorLogo(sponsor?.logoUrl);sponsorLogo.src=url;sponsorLogo.classList.toggle('hidden',!url);sponsorLogo.onerror=()=>sponsorLogo.classList.add('hidden');}
  text('[data-rail-announcement]',rail.announcement);
  const rotation=$<HTMLElement>('[data-rail-rotation-progress]');if(rotation){rotation.classList.remove('running');rotation.style.animationDuration=`${rail.rotationSeconds}s`;void rotation.offsetWidth;if(rail.visible&&rail.automatic&&!rail.held)rotation.classList.add('running');}
});
const requestedTransitionStyle = previewParams.get('style');
const previewTransitionStyle: Exclude<HbsTransitionMode,'obs'> = requestedTransitionStyle === 'diagonal' || requestedTransitionStyle === 'iris' ? requestedTransitionStyle : 'corner';
const previewTransition = !window.nodecg && previewParams.get('preview') === '1' ? { ...mockTransitionOverlay, phase: 'covering' as const, style: previewTransitionStyle, startedAt: Date.now() } : mockTransitionOverlay;
const transitionRep=observe<TransitionOverlayState>('transitionOverlay', previewTransition, (raw) => {
  if (layout !== 'transition-overlay') return;
  const transition=normalizeTransitionOverlay(raw);const root=$<HTMLElement>('[data-transition-overlay]');if(!root)return;
  root.className='transition-overlay';void root.offsetWidth;root.classList.add(transition.style,transition.phase);root.style.setProperty('--transition-half-ms',`${transition.durationMs/2}ms`);root.style.setProperty('--transition-motion-ms',`${transition.durationMs*.38}ms`);root.setAttribute('aria-hidden',String(transition.phase==='idle'||transition.phase==='error'));
});
if(layout==='transition-overlay'&&!window.nodecg&&previewParams.get('preview')==='1')window.setInterval(()=>{const current=transitionRep.get();transitionRep.set({...current,requestId:current.requestId+1,phase:current.phase==='covering'?'revealing':'covering',startedAt:Date.now()});},previewTransition.durationMs/2);

const requestedFeedCount = Number(previewParams.get('feeds'));
const previewSpeedrun: SpeedrunState = !window.nodecg && [1, 2, 3, 4].includes(requestedFeedCount)
  ? {
      ...mockSpeedrun,
      feedCount: requestedFeedCount as FeedCount,
      cameraVisible: previewParams.get('camera') !== '0',
      timerVisible: previewParams.get('timer') !== '0',
      guidesVisible: previewParams.get('guides') !== '0'
    }
  : mockSpeedrun;

let speedrunState = previewSpeedrun;
const renderTimer = () => {
  if (layout !== 'speedrun') return;
  const elapsed = timerElapsed(speedrunState.timer);
  const hours = Math.floor(elapsed / 3_600_000);
  const minutes = Math.floor(elapsed / 60_000) % 60;
  const seconds = Math.floor(elapsed / 1000) % 60;
  const tenths = Math.floor(elapsed / 100) % 10;
  text('[data-run-timer]', `${hours ? `${String(hours).padStart(2,'0')}:` : ''}${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${tenths}`);
  text('[data-timer-status]', speedrunState.timer.running ? 'Timer · running' : 'Timer · paused');
};
observe<SpeedrunState>('speedrun', previewSpeedrun, (run) => {
  speedrunState = run;
  const identities = speedrunFeedIdentities(run);
  const zone = $('[data-feed-zone]');
  if (zone) zone.className = `feed-zone count-${run.feedCount}${run.cameraVisible ? ' has-camera' : ''}${run.guidesVisible ? ' guides' : ''}`;
  for (let index=1; index<=4; index++) $(`.feed-${index}`)?.classList.toggle('hidden', index > run.feedCount);
  $('[data-runner-rail]')?.classList.toggle('hidden', !run.cameraVisible);
  $('[data-timer-card]')?.classList.toggle('hidden', !run.timerVisible);
  identities.forEach((identity, index) => {
    const position = index + 1;
    const card = $(`[data-feed-identity-card="${position}"]`);
    const identityVisible = (run.feedIdentitiesVisible ?? true) && position <= run.feedCount && Boolean(identity.name || identity.pronouns || identity.social);
    card?.classList.toggle('hidden', !identityVisible);
    card?.classList.toggle('has-social', Boolean((run.feedSocialsVisible ?? true) && identity.social));
    text(`[data-feed-runner="${position}"]`, identity.name);
    text(`[data-feed-pronouns="${position}"]`, identity.pronouns);
    text(`[data-feed-social="${position}"]`, identity.social);
  });
  text('[data-run-game]', run.game); text('[data-run-platform]', run.platform); text('[data-runner]', run.runner); text('[data-runner-pronouns]', run.pronouns); text('[data-run-category]', run.category); text('[data-run-category-footer]', run.category); text('[data-run-estimate]', run.estimate); text('[data-feed-label]', `${run.feedCount} ${run.feedCount === 1 ? 'feed' : 'feeds'}`);
  document.body.classList.toggle('guides-visible', run.guidesVisible);
  renderTimer();
});
if (layout === 'speedrun') window.setInterval(renderTimer, 100);
