import './styles/base.css';
import './styles/program-preview.css';
import { mockShow } from './mock';
import { observe } from './replicant';
import type { ShowMode, ShowState } from './types';

const params = new URLSearchParams(location.search);
const requested = params.get('layout')?.toLowerCase();
const fixedLayouts: Record<string, string> = { tournament: 'tournament', gameplay: 'speedrun', speedrun: 'speedrun', interview: 'show', stage: 'show', show: 'show', break: 'break', schedule: 'break', technical: 'technical' };
const modeLayouts: Record<ShowMode, string> = { tournament: 'tournament', gameplay: 'speedrun', interview: 'show', stage: 'show', break: 'break', schedule: 'break', technical: 'technical' };
const fixedLayout = requested ? fixedLayouts[requested] : undefined;
const frame = document.querySelector<HTMLIFrameElement>('[data-preview-main]');
const label = document.querySelector<HTMLElement>('[data-preview-layout]');

function showLayout(layout: string, description: string): void {
  const next = `${layout}.html?background=1`;
  if (frame && !frame.src.endsWith(next)) frame.src = next;
  if (label) label.textContent = description;
}

observe<ShowState>('show', mockShow, (show) => {
  if (fixedLayout) showLayout(fixedLayout, `Fixed · ${requested}`);
  else showLayout(modeLayouts[show.mode], `Following Live Control · ${show.mode}`);
});

const fit = () => { const preview=document.querySelector<HTMLElement>('[data-program-preview]');if(preview)preview.style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`; };
addEventListener('resize',fit);fit();
