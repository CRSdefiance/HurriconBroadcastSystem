export interface Rect { x: number; y: number; width: number; height: number }
export function fitRect(source: {width:number;height:number}, viewport: Rect, mode: 'contain'|'cover'): Rect {
  if (source.width <= 0 || source.height <= 0 || viewport.width <= 0 || viewport.height <= 0) throw new Error('Source and viewport dimensions must be positive.');
  const scale = mode === 'contain' ? Math.min(viewport.width/source.width,viewport.height/source.height) : Math.max(viewport.width/source.width,viewport.height/source.height);
  const width=source.width*scale,height=source.height*scale;
  return {x:viewport.x+(viewport.width-width)/2,y:viewport.y+(viewport.height-height)/2,width,height};
}

