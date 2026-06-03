import { describe, it, expect } from 'vitest';
import { DEFAULT_SOURCE_ID, getEmbedUrl } from './sources';

describe('sources.ts', () => {
  describe('getEmbedUrl', () => {
    it('uses VidKing as the default source id', () => {
      expect(DEFAULT_SOURCE_ID).toBe('vidking');
    });

    it('generates correct movie URL for VidKing with branded defaults', () => {
      const url = getEmbedUrl('vidking', 'movie', 123);
      expect(url).toBe('https://www.vidking.net/embed/movie/123?color=e50914&autoPlay=true');
    });

    it('generates correct TV URL for VidKing with resume progress', () => {
      const url = getEmbedUrl('vidking', 'tv', 123, 1, 5, {
        progress: 120.8,
        nextEpisode: false,
        episodeSelector: false,
      });
      expect(url).toBe('https://www.vidking.net/embed/tv/123/1/5?color=e50914&autoPlay=true&nextEpisode=false&episodeSelector=false&progress=120');
    });

    it('generates correct movie URL for videasy', () => {
      const url = getEmbedUrl('videasy', 'movie', 123);
      expect(url).toBe('https://player.videasy.net/movie/123');
    });

    it('generates correct tv URL for videasy', () => {
      const url = getEmbedUrl('videasy', 'tv', 123, 1, 5);
      expect(url).toBe('https://player.videasy.net/tv/123/1/5');
    });

    it('generates correct movie URL for vidsrc.me', () => {
      const url = getEmbedUrl('vidsrc_me', 'movie', 123);
      expect(url).toBe('https://vidsrc.me/embed/movie/123');
    });

    it('generates correct tv URL for vidsrc.me', () => {
      const url = getEmbedUrl('vidsrc_me', 'tv', 123, 2, 10);
      expect(url).toBe('https://vidsrc.me/embed/tv/123/2/10');
    });

    it('uses defaults for season and episode if not provided', () => {
      const url = getEmbedUrl('videasy', 'tv', 123);
      expect(url).toBe('https://player.videasy.net/tv/123/1/1');
    });
  });
});
