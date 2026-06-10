import { describe, expect, it } from 'vitest';
import { buildDownloadRequestUrl, normalizeDownloadsResponse } from './downloads';

describe('downloads.ts', () => {
  describe('buildDownloadRequestUrl', () => {
    it('builds movie download URLs from a REST base URL', () => {
      expect(buildDownloadRequestUrl('https://example.com/api/downloads', {
        mediaType: 'movie',
        tmdbId: 550,
      })).toBe('https://example.com/api/downloads/movie/550');
    });

    it('builds TV download URLs from a REST base URL', () => {
      expect(buildDownloadRequestUrl('https://example.com/api/downloads/', {
        mediaType: 'tv',
        tmdbId: 1399,
        season: 1,
        episode: 2,
      })).toBe('https://example.com/api/downloads/tv/1399/1/2');
    });

    it('supports template URLs', () => {
      expect(buildDownloadRequestUrl('https://example.com/{type}/{tmdbId}?s={season}&e={episode}', {
        mediaType: 'movie',
        tmdbId: 11,
      })).toBe('https://example.com/movie/11?s=&e=');
    });

    it('returns null when TV episode data is incomplete', () => {
      expect(buildDownloadRequestUrl('https://example.com/api/downloads', {
        mediaType: 'tv',
        tmdbId: 1399,
        season: 1,
      })).toBeNull();
    });
  });

  describe('normalizeDownloadsResponse', () => {
    it('normalizes common download response fields', () => {
      expect(normalizeDownloadsResponse({
        downloads: [
          {
            link: 'https://cdn.example.com/movie-1080p.mp4',
            resolution: '1080p',
            fileSize: '2.4 GB',
          },
        ],
      })).toEqual({
        downloads: [
          {
            url: 'https://cdn.example.com/movie-1080p.mp4',
            quality: '1080P',
            size: '2.4 GB',
            format: 'MP4',
            server: undefined,
          },
        ],
      });
    });

    it('drops entries without a URL', () => {
      expect(normalizeDownloadsResponse([{ quality: '720p' }])).toEqual({ downloads: [] });
    });
  });
});
