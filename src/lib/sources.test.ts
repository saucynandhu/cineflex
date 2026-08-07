import { describe, it, expect } from 'vitest';
import { getEmbedUrl, SOURCES } from './sources';

describe('sources.ts', () => {
  describe('getEmbedUrl', () => {
    it('uses VidSrc.me as the first source', () => {
      expect(SOURCES[0]).toEqual({ id: 'vidsrc_me', name: 'VidSrc.me' });
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
      const url = getEmbedUrl('vidsrc_me', 'tv', 123);
      expect(url).toBe('https://vidsrc.me/embed/tv/123/1/1');
    });
  });
});
