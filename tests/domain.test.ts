import { describe, expect, it } from 'vitest';
import { changeScore, defaultMatch, speedrunFeedIdentities, swapPlayers, timerAction, timerElapsed } from '../src/domain';
import { nextSponsor } from '../src/sponsors';
import { parseSchedule } from '../src/schedule';
import { fitRect } from '../src/viewport';
import { advanceBroadcastRail, availableRailModules, defaultBroadcastRail, normalizeBroadcastRail } from '../src/rail';
import { defaultTransitionOverlay, defaultTransitionSettings, normalizeTransitionOverlay, normalizeTransitionSettings, transitionHalfMs } from '../src/transition';

describe('match operations',()=>{
  it('swaps all player data and scores',()=>{const match=defaultMatch();match.player1={displayName:'Alpha',social:'@a',score:2};match.player2={displayName:'Beta',social:'@b',score:1};const result=swapPlayers(match);expect(result.player1).toEqual({displayName:'Beta',social:'@b',score:1});expect(result.player2.displayName).toBe('Alpha');});
  it('does not decrement below zero',()=>expect(changeScore(defaultMatch(),'player1',-1).player1.score).toBe(0));
});
describe('local data helpers',()=>{
  it('rotates sponsors and handles an empty folder',()=>{expect(nextSponsor([])).toBeNull();expect(nextSponsor([{id:'a',path:'a.svg'},{id:'b',path:'b.svg'}],'a')?.id).toBe('b');});
  it('parses schedules with generated IDs',()=>expect(parseSchedule([{title:' Finals '}])).toEqual([{id:'item-1',title:'Finals',startTime:undefined,subtitle:undefined}]));
  it('calculates contain and cover rectangles',()=>{const contained=fitRect({width:1920,height:1080},{x:0,y:0,width:1000,height:1000},'contain');expect(contained.x).toBeCloseTo(0);expect(contained.y).toBeCloseTo(218.75);expect(contained.width).toBeCloseTo(1000);expect(contained.height).toBeCloseTo(562.5);expect(fitRect({width:1920,height:1080},{x:0,y:0,width:1000,height:1000},'cover').width).toBeCloseTo(1777.78,1);});
});
describe('run timer',()=>{
  it('starts, advances and pauses without losing elapsed time',()=>{const started=timerAction({running:false,elapsedMs:500},'start',1_000);expect(timerElapsed(started,2_000)).toBe(1_500);expect(timerAction(started,'pause',2_000)).toEqual({running:false,elapsedMs:1_500});});
  it('resets to a stopped zero timer',()=>expect(timerAction({running:true,elapsedMs:900,startedAt:100},'reset',2_000)).toEqual({running:false,elapsedMs:0}));
});
describe('speedrun identities',()=>{
  it('migrates legacy runner fields into feed one',()=>expect(speedrunFeedIdentities({feedCount:1,cameraVisible:false,timerVisible:false,guidesVisible:false,game:'Game',runner:'Legacy Runner',pronouns:'they/them',timer:{running:false,elapsedMs:0}})[0]).toEqual({name:'Legacy Runner',pronouns:'they/them',social:undefined}));
});
describe('broadcast rail',()=>{
  it('provides a safe default with all modules enabled',()=>{
    const rail=defaultBroadcastRail();
    expect(rail.activeModule).toBe('programming');
    expect(availableRailModules(rail)).toEqual(['programming']);
  });
  it('normalizes unsafe values and skips empty modules',()=>{
    const rail=normalizeBroadcastRail({rotationSeconds:999,activeModule:'announcement' as never,announcement:'',donation:{total:-4,goal:100,currency:''},sponsors:[{id:'s',name:'Sponsor',enabled:true}],enabledModules:{donation:true,sponsor:true,announcement:true,programming:true}});
    expect(rail.rotationSeconds).toBe(300);
    expect(rail.donation.total).toBe(0);
    expect(rail.activeModule).toBe('donation');
    expect(availableRailModules(rail)).toEqual(['donation','sponsor','programming']);
  });
  it('advances forward and backward while skipping unavailable modules',()=>{
    const rail=normalizeBroadcastRail({...defaultBroadcastRail(),donation:{total:10,goal:100,currency:'USD'},announcement:'Donate now'});
    expect(advanceBroadcastRail(rail,1,123).activeModule).toBe('donation');
    expect(advanceBroadcastRail(rail,-1,123).activeModule).toBe('announcement');
    expect(advanceBroadcastRail({...rail,held:true},1).activeModule).toBe('donation');
  });
});
describe('browser transitions',()=>{
  it('uses deterministic safe defaults',()=>{
    expect(defaultTransitionSettings()).toEqual({mode:'obs',obsName:'Fade',durationMs:700});
    expect(defaultTransitionOverlay()).toEqual({requestId:0,phase:'idle',style:'corner',durationMs:700,startedAt:0});
  });
  it('clamps transition duration and rejects invalid settings',()=>{
    const settings=normalizeTransitionSettings({mode:'iris',obsName:'  HBS Wipe  ',durationMs:99999});
    expect(settings).toEqual({mode:'iris',obsName:'HBS Wipe',durationMs:4000});
    expect(normalizeTransitionSettings({mode:'invalid' as never,durationMs:-1})).toEqual({mode:'obs',obsName:'Fade',durationMs:400});
    expect(transitionHalfMs(settings)).toBe(2000);
  });
  it('normalizes overlay request and phase values',()=>{
    expect(normalizeTransitionOverlay({requestId:3.9,phase:'covering',style:'iris',durationMs:1,startedAt:-5,error:'  failed  '})).toEqual({requestId:3,phase:'covering',style:'iris',durationMs:400,startedAt:0,error:'failed'});
    expect(normalizeTransitionOverlay({phase:'unknown' as never,style:'obs' as never})).toEqual(defaultTransitionOverlay());
  });
});
