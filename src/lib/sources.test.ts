import { describe, it, expect } from 'vitest';
import { getEmbedUrl } from './sources';

describe('sources.ts', () => {
  describe('getEmbedUrl', () => {
    it('generates correct movie URL for vidlink', () => {
      const url = getEmbedUrl('vidlink', 'movie', 123);
      expect(url).toBe('https://vidlink.pro/movie/123');
    });

    it('generates correct tv URL for vidlink', () => {
      const url = getEmbedUrl('vidlink', 'tv', 123, 1, 5);
      expect(url).toBe('https://vidlink.pro/tv/123/1/5');
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
      const url = getEmbedUrl('vidlink', 'tv', 123);
      expect(url).toBe('https://vidlink.pro/tv/123/1/1');
    });
  });
});
