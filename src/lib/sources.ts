export type SourceId = 
  | 'videasy'
  | 'vidlink' 
  | 'vidfast'
  | 'autoembed'
  | 'vidsrc_me' 
  | 'vidsrc_cc' 
  | 'vidsrc_icu' 
  | 'vidsrc_vip'
  | 'rivestream'
  | 'pstream'
  | 'twoembed' 
  | 'superembed'
  | 'autoembed_co';

export interface Source {
  id: SourceId;
  name: string;
}

export const SOURCES: Source[] = [
  { id: 'videasy', name: 'Videasy' },
  { id: 'vidlink', name: 'VidLink' },
  { id: 'vidfast', name: 'VidFast' },
  { id: 'autoembed', name: 'AutoEmbed' },
  { id: 'vidsrc_me', name: 'VidSrc.me' },
  { id: 'vidsrc_cc', name: 'VidSrc.cc' },
  { id: 'vidsrc_icu', name: 'VidSrc.icu' },
  { id: 'vidsrc_vip', name: 'VidSrc.vip' },
  { id: 'rivestream', name: 'Rivestream' },
  { id: 'pstream', name: 'Pstream' },
  { id: 'twoembed', name: '2Embed' },
  { id: 'superembed', name: 'SuperEmbed' },
  { id: 'autoembed_co', name: 'AutoEmbed.co' },
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
    videasy: {
      movie: `https://player.videasy.net/movie/${tmdbId}`,
      tv: `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`
    },
    vidlink: {
      movie: `https://vidlink.pro/movie/${tmdbId}`,
      tv: `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
    },
    vidfast: {
      movie: `https://vidfast.pro/movie/${tmdbId}`,
      tv: `https://vidfast.pro/tv/${tmdbId}/${s}/${e}`
    },
    autoembed: {
      movie: `https://player.autoembed.cc/embed/movie/${tmdbId}`,
      tv: `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`
    },
    vidsrc_me: {
      movie: `https://vidsrc.me/embed/movie/${tmdbId}`,
      tv: `https://vidsrc.me/embed/tv/${tmdbId}/${s}/${e}`
    },
    vidsrc_cc: {
      movie: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
      tv: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}`
    },
    vidsrc_icu: {
      movie: `https://vidsrc.icu/embed/movie/${tmdbId}`,
      tv: `https://vidsrc.icu/embed/tv/${tmdbId}/${s}/${e}`
    },
    vidsrc_vip: {
      movie: `https://vidsrc.vip/embed/movie/${tmdbId}`,
      tv: `https://vidsrc.vip/embed/tv/${tmdbId}/${s}/${e}`
    },
    rivestream: {
      movie: `https://rivestream.org/embed/movie/${tmdbId}`,
      tv: `https://rivestream.org/embed/tv/${tmdbId}/${s}/${e}`
    },
    pstream: {
      movie: `https://iframe.pstream.org/movie/${tmdbId}`,
      tv: `https://iframe.pstream.org/tv/${tmdbId}/${s}/${e}`
    },
    twoembed: {
      movie: `https://www.2embed.cc/embed/${tmdbId}`,
      tv: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
    },
    superembed: {
      movie: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
      tv: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
    },
    autoembed_co: {
      movie: `https://autoembed.co/movie/tmdb/${tmdbId}`,
      tv: `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
    }
  };

  const pattern = patterns[sourceId];
  return type === 'movie' ? pattern.movie : pattern.tv;
};
