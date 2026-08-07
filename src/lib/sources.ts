export type SourceId = 
  | 'vidfast'
  | 'vidsrc_me' 
  | 'vidsrc_cc' 
  | 'twoembed' 
  | 'superembed';

export interface Source {
  id: SourceId;
  name: string;
}

export const SOURCES: Source[] = [
  { id: 'vidsrc_me', name: 'VidSrc.me' },
  { id: 'vidfast', name: 'VidFast' },
  { id: 'vidsrc_cc', name: 'VidSrc.cc' },
  { id: 'twoembed', name: '2Embed' },
  { id: 'superembed', name: 'SuperEmbed' },
];

export const getEmbedUrl = (
  sourceId: SourceId, 
  type: 'movie' | 'tv', 
  tmdbId: string | number, 
  season?: string | number, 
  episode?: string | number
): string => {
  const s = season || '1';
  const e = episode || '1';

  const patterns: Record<SourceId, { movie: string; tv: string }> = {
    vidfast: {
      movie: `https://vidfast.pro/movie/${tmdbId}`,
      tv: `https://vidfast.pro/tv/${tmdbId}/${s}/${e}`
    },
    vidsrc_me: {
      movie: `https://vidsrc.me/embed/movie/${tmdbId}`,
      tv: `https://vidsrc.me/embed/tv/${tmdbId}/${s}/${e}`
    },
    vidsrc_cc: {
      movie: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
      tv: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}`
    },
    twoembed: {
      movie: `https://www.2embed.cc/embed/${tmdbId}`,
      tv: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
    },
    superembed: {
      movie: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
      tv: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
    }
  };

  const pattern = patterns[sourceId];
  return type === 'movie' ? pattern.movie : pattern.tv;
};
