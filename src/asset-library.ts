export interface BroadcastImageAsset {
  sum: string;
  base: string;
  ext: string;
  name: string;
  namespace: string;
  category: string;
  url: string;
}

export const broadcastImageAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('https://') || url.startsWith('/bundles/')) return url;
  return url.startsWith('/assets/hurricon-broadcast/images/') ? url : '';
};
